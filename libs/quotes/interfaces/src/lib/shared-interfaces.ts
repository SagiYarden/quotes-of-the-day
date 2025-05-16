export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalRequested: number;
    hasMore: boolean;
  };
};
