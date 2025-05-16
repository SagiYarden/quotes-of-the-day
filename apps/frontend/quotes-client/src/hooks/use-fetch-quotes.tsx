import { useEffect, useState } from 'react';
import axios from 'axios';
import { useEnv } from '../providers/env-provider';
import { Quote, ApiEndpoints } from '@monorepo/quotes-interfaces';

type UseFetchQuotesProps = {
  count: number;
  page?: number;
  pageSize?: number;
};

export const useFetchQuotes = ({
  count,
  page = 1,
  pageSize = 10,
}: UseFetchQuotesProps) => {
  const [quotes, setArticles] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { backendUrl } = useEnv();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const url = `${backendUrl}/${ApiEndpoints.BASE}/${ApiEndpoints.RANDOM_LIST}`;
        const response = await axios.get(url, {
          params: { count, page, pageSize },
        });

        setArticles(response.data);
        setLoading(false);
        setError(false);
      } catch (error) {
        console.error('Error fetching random list of quotes:', error);
        setLoading(false);
        setError(true);
      }
    };

    fetchQuotes();
  }, [backendUrl, count, page, pageSize]);

  return { quotes, loading, error };
};
