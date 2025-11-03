export interface RecordInteractionRequest {
  userId: string;
  bookId: string;
  interactionType: 'view' | 'rating' | 'wishlist';
  ratingValue?: number;
  timeOnPage?: number;
  sessionId: string;
}

export interface UserInteractionsRequest {
  userId: string;
  limit?: number;
  page?: number;
}

export interface BookInteractionsRequest {
  bookId: string;
  limit?: number;
  page?: number;
}

export interface InteractionResponse {
  success: boolean;
  message: string;
  data?: {
    interaction?: any;
    interactions?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface InteractionStats {
  totalViews: number;
  totalRatings: number;
  totalWishlists: number;
  averageRating: number;
}