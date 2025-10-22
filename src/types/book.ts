export interface BookFilters {
  genres?: string[];
  authors?: string[];
  minRating?: number;
  maxRating?: number;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface BooksResponse {
  success: boolean;
  message: string;
  data?: {
    books: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface BookResponse {
  success: boolean;
  message: string;
  data?: {
    book: any;
  };
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data?: {
    books: any[];
    total: number;
  };
  error?: string;
}

export interface UpdateMetricsRequest {
  viewCount?: number;
  ratingCount?: number;
  averageRating?: number;
}