import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { Quote } from '@monorepo/quotes-interfaces';

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
   * @returns array of quotes
   */
  async getQuotes(count: number, page = 1, perPage = 25): Promise<Quote[]> {
    const totalPages = Math.ceil(count / perPage);

    // if we've already gone past the max pages, no more quotes
    if (page > totalPages) {
      return [];
    }

    // cache per (count,page,perPage) so last‐page slices still obey cache
    const cacheKey = `q_cnt${count}_pg${page}_pp${perPage}`;
    let pageQuotes = await this.cache.get<Quote[]>(cacheKey);

    if (!pageQuotes) {
      pageQuotes = await this.fetchQuotesWithRetry(page, perPage);
      await this.cache.set(cacheKey, pageQuotes);
    }

    // calculate how many items this page is actually allowed to return
    // this is to ensure we never exceed the global `count` cap as requested in step 1.
    const alreadyReturned = (page - 1) * perPage;
    const remaining = count - alreadyReturned;
    const take = Math.min(perPage, remaining);

    return pageQuotes.slice(0, take);
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
        const delay = this.RETRY_DELAY * Math.pow(2, retries);
        await new Promise((r) => setTimeout(r, delay));
        return this.fetchQuotesWithRetry(page, perPage, retries + 1);
      }
      throw e;
    }
  }
}
