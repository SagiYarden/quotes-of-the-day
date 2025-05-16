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

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  /**
   * Get quotes from favqs.com
   * @param count number of quotes to get
   * @param page page number to get
   * @param perPage number of quotes per page
   * @returns array of quotes with pagination info
   */
  async getQuotes(
    count: number,
    page = 1,
    perPage = 25
  ): Promise<PaginatedResponse<Quote>> {
    // 1. Use a more consistent cache key without timestamps
    const cacheKey = `quotes_c${count}_p${perPage}`;
    let allQuotes = await this.cache.get<Quote[]>(cacheKey);

    if (!allQuotes || allQuotes.length < count) {
      // 2. Pre-allocate arrays and sets for better performance
      const fetchedQuotes: Quote[] = [];
      const seenIds = new Set<number | string>();
      const batchesNeeded = Math.ceil(count / perPage) + 1;

      // 3. Use Promise.all to fetch batches in parallel (with rate limiting)
      const batchPromises = [];
      for (let i = 0; i < batchesNeeded; i++) {
        // 4. Use stable cache keys for batch quotes
        const batchKey = `quote_batch_${i}_${perPage}`;
        const batchQuotes = await this.cache.get<Quote[]>(batchKey);

        if (!batchQuotes) {
          // 5. Delay only the API calls, not the entire operation
          const delay = i * 300;
          batchPromises.push(
            this.delayedFetch(i, perPage, delay).then((quotes) => {
              // Cache each batch with stable key
              this.cache.set(batchKey, quotes);
              return quotes;
            })
          );
        } else {
          batchPromises.push(Promise.resolve(batchQuotes));
        }
      }

      // Wait for all batches and process results
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
      await this.cache.set(cacheKey, allQuotes);
    }

    // Client-side pagination - unchanged
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
   * @returns A promise that resolves to an array of quotes.
   */
  private async delayedFetch(
    page: number,
    perPage: number,
    delayMs: number
  ): Promise<Quote[]> {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return this.fetchQuotesWithRetry(1, perPage);
  }

  /**
   * Fetch quotes from the API with retry logic for rate limiting and server errors.
   * @param page The page number to fetch.
   * @param perPage The number of quotes per page.
   * @param retries The current retry count.
   * @returns A promise that resolves to an array of quotes.
   */
  private async fetchQuotesWithRetry(
    page: number,
    perPage: number,
    retries = 0
  ): Promise<Quote[]> {
    try {
      const url = this.configService.get<string>('FAVQS_API_URL');
      const token = this.configService.get<string>('FAVQS_API_KEY');
      const res = await axios.get(`${url}/quotes`, {
        params: { page, filter: 'random', per_page: perPage },
        headers: { Authorization: `Token token=${token}` },
      });
      return res.data.quotes as Quote[];
    } catch (e: any) {
      const status = e?.response?.status;
      if ((status === 429 || status === 503) && retries < this.MAX_RETRIES) {
        // Exponential backoff for rate limiting and server errors
        // Retry after a delay
        // The delay increases exponentially with each retry
        const delay = this.RETRY_DELAY * Math.pow(2, retries);
        await new Promise((r) => setTimeout(r, delay));
        return this.fetchQuotesWithRetry(page, perPage, retries + 1);
      }
      throw e;
    }
  }
}
