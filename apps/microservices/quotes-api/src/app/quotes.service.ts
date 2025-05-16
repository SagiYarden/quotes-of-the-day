import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { PaginatedResponse, Quote } from '@monorepo/quotes-interfaces';

@Injectable()
export class QuotesService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // ms
  private readonly CACHE_TTL = 86400; // 24 hours

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  /**
   * Get quotes from favqs.com with optional tag filtering
   * @param count number of quotes to get
   * @param page page number to get
   * @param perPage number of quotes per page
   * @param tag optional tag to filter quotes by
   * @returns array of quotes with pagination info
   */
  async getQuotes(
    count: number,
    page = 1,
    perPage = 25,
    tag?: string
  ): Promise<PaginatedResponse<Quote>> {
    // Use different cache keys for random vs tag-filtered quotes
    const cacheKey = tag
      ? `quotes_tag_${tag}_c${count}_p${perPage}`
      : `quotes_c${count}_p${perPage}`;

    let allQuotes = await this.cache.get<Quote[]>(cacheKey);

    if (!allQuotes || allQuotes.length < count) {
      const fetchedQuotes: Quote[] = [];
      const seenIds = new Set<number | string>();

      // For tagged quotes, we might need more batches since there might be fewer quotes per tag
      const batchesNeeded = tag
        ? Math.ceil(count / perPage) + 2
        : Math.ceil(count / perPage) + 1;

      const batchPromises = [];
      for (let i = 0; i < batchesNeeded; i++) {
        // For tag-based searches, use actual pagination (i+1)
        // For random quotes, always use page=1 since random doesn't support pagination
        const batchPage = tag ? i + 1 : 1;

        // Use different cache keys for different types of batches
        const batchKey = tag
          ? `quote_tag_${tag}_batch_${batchPage}_${perPage}`
          : `quote_batch_${i}_${perPage}`;

        const batchQuotes = await this.cache.get<Quote[]>(batchKey);

        if (!batchQuotes) {
          // Add progressive delay to avoid rate limits
          const delay = i * 300;
          batchPromises.push(
            this.delayedFetch(batchPage, perPage, delay, tag).then((quotes) => {
              // Cache each batch separately
              this.cache.set(batchKey, quotes, this.CACHE_TTL);
              return quotes;
            })
          );
        } else {
          batchPromises.push(Promise.resolve(batchQuotes));
        }
      }

      // Process all batches and deduplicate quotes
      const batchResults = await Promise.all(batchPromises);
      for (const batch of batchResults) {
        for (const quote of batch) {
          if (!seenIds.has(quote.id)) {
            seenIds.add(quote.id);
            fetchedQuotes.push(quote);
            if (fetchedQuotes.length >= count) break;
          }
        }
        if (fetchedQuotes.length >= count) break;
      }

      allQuotes = fetchedQuotes;
      await this.cache.set(cacheKey, allQuotes, this.CACHE_TTL);
    }

    // Client-side pagination - same logic for both random and tag filtering
    const totalPages = Math.ceil(Math.min(allQuotes.length, count) / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, count, allQuotes.length);

    if (page > totalPages) {
      return {
        items: [],
        pagination: {
          page,
          pageSize: perPage,
          totalRequested: count,
          hasMore: false,
        },
      };
    }

    return {
      items: allQuotes.slice(startIndex, endIndex),
      pagination: {
        page,
        pageSize: perPage,
        totalRequested: count,
        hasMore:
          page < totalPages &&
          page * perPage < Math.min(count, allQuotes.length),
      },
    };
  }

  /**
   * Fetch quotes with a delay to avoid hitting the API rate limit.
   * @param page The page number to fetch.
   * @param perPage The number of quotes per page.
   * @param delayMs The delay in milliseconds before fetching.
   * @param tag Optional tag to filter quotes by.
   * @returns A promise that resolves to an array of quotes.
   */
  private async delayedFetch(
    page: number,
    perPage: number,
    delayMs: number,
    tag?: string
  ): Promise<Quote[]> {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return this.fetchQuotesWithRetry(page, perPage, 0, tag);
  }

  /**
   * Fetch quotes from the API with retry logic for rate limiting and server errors.
   * @param page The page number to fetch.
   * @param perPage The number of quotes per page.
   * @param retries The current retry count.
   * @param tag Optional tag to filter quotes by.
   * @returns A promise that resolves to an array of quotes.
   */
  private async fetchQuotesWithRetry(
    page: number,
    perPage: number,
    retries = 0,
    tag?: string
  ): Promise<Quote[]> {
    try {
      const url = this.configService.get<string>('FAVQS_API_URL');
      const token = this.configService.get<string>('FAVQS_API_KEY');

      // Build params object based on whether we're filtering by tag or fetching random
      const params: Record<string, string | number> = {
        page,
        per_page: perPage,
        filter: tag || 'random',
      };

      if (tag) {
        params.type = 'tag';
      }

      const res = await axios.get(`${url}/quotes`, {
        headers: { Authorization: `Token token=${token}` },
        params,
      });

      return res.data.quotes as Quote[];
    } catch (e: any) {
      const status = e?.response?.status;
      if ((status === 429 || status === 503) && retries < this.MAX_RETRIES) {
        // Exponential backoff for rate limiting and server errors
        const delay = this.RETRY_DELAY * Math.pow(2, retries);
        await new Promise((r) => setTimeout(r, delay));
        return this.fetchQuotesWithRetry(page, perPage, retries + 1, tag);
      }
      throw e;
    }
  }
}
