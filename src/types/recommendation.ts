export interface ContentBasedRecommendationRequest {
  bookId: string;
  limit?: number;
}

export interface CollaborativeRecommendationRequest {
  userId: string;
  limit?: number;
}

export interface UserRecommendationRequest {
  userId: string;
  limit?: number;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data?: {
    recommendations: Array<{
      book: any;
      score: number;
      reason: string;
      type: 'content_based' | 'collaborative' | 'hybrid';
    }>;
  };
  error?: string;
}

export interface SimilarityResult {
  bookId: string;
  score: number;
  reasons: string[];
}

