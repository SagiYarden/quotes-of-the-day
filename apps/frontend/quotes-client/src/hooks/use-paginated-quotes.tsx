import axios from 'axios';
import { useEnv } from '../providers/env-provider';
import { Quote, ApiEndpoints } from '@monorepo/quotes-interfaces';
import { usePagination } from './use-pagination';

type UsePaginatedQuotesProps = {
  count: number;
};

export const usePaginatedQuotes = ({ count }: UsePaginatedQuotesProps) => {
  const { backendUrl } = useEnv();
  const pageSize = 10; // Default page size (can be adjusted according to product needs)

  const fetchQuotes = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const url = `${backendUrl}/${ApiEndpoints.BASE}/${ApiEndpoints.RANDOM_LIST}`;
    const response = await axios.get(url, {
      params: { count, page, pageSize },
    });

    return response.data;
  };

  return usePagination<Quote>({ fetchFn: fetchQuotes, pageSize });
};
