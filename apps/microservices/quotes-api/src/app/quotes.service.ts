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
    // First, check if we have enough quotes cached already
    const cacheKey = `all_random_quotes_${perPage}`;
    let allQuotes = await this.cache.get<Quote[]>(cacheKey);

    // If we don't have quotes cached, or need more, fetch them
    if (!allQuotes || allQuotes.length < count) {
      // Calculate how many batches we need - add extra to account for potential duplicates
      const batchesNeeded = Math.ceil(count / perPage) + 1;
      const fetchedQuotes: Quote[] = [];
      const seenIds = new Set<number | string>();

      // Fetch multiple batches of random quotes (always page 1)
      for (let i = 0; i < batchesNeeded; i++) {
        const batchKey = `random_batch_${i}_${perPage}_${Date.now()}`;
        let batchQuotes = await this.cache.get<Quote[]>(batchKey);

        if (!batchQuotes) {
          // Increase delay between requests to reduce chance of duplicates
          if (i > 0) {
            await new Promise((r) => setTimeout(r, 500)); // Increased from 200ms
          }

          batchQuotes = await this.fetchQuotesWithRetry(1, perPage);

          // Cache each batch separately (1 hour)
          await this.cache.set(batchKey, batchQuotes, 3600);
        }

        // Only add non-duplicate quotes
        for (const quote of batchQuotes) {
          if (!seenIds.has(quote.id)) {
            seenIds.add(quote.id);
            fetchedQuotes.push(quote);
          }
        }

        // If we have enough unique quotes, stop fetching
        if (fetchedQuotes.length >= count) {
          break;
        }
      }

      // Store unique quotes
      allQuotes = fetchedQuotes;
      // Cache the combined result (shorter time since it's derived)
      await this.cache.set(cacheKey, allQuotes, 1800);
    }

    // Rest of the code stays the same...
    const totalPages = Math.ceil(Math.min(allQuotes.length, count) / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, count, allQuotes.length);

    // No more quotes if we're past the last page
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
