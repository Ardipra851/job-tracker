export interface PaginationOption {
  page: number;
  limit: number;
}

export interface Pagination<T> {
  data: T[];
  paging: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}
