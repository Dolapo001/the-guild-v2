import { api } from '../lib/api-client';

export interface FavoriteItem {
  uid: string;
  object_id: string;
  content_type: 'business' | 'service' | 'product';
  content_object: any;
  is_favorited: boolean;
}

export const socialService = {
    toggleFavorite: async (objectId: string, contentType: 'business' | 'service' | 'product'): Promise<{ isFavorited: boolean }> => {
        const data = await api.post<{ is_favorited: boolean }>('/social/favorites/toggle/', { object_id: objectId, content_type: contentType });
        // Normalize snake_case backend response to camelCase
        return { isFavorited: data.is_favorited };
    },

    getFavorites: async (): Promise<any[]> => {
        return api.get<any[]>('/social/favorites/');
    },

    getReviews: async (): Promise<any[]> => {
        return api.get<any[]>('/social/reviews/');
    },

    replyToReview: async (reviewUid: string, reply: string): Promise<any> => {
        return api.post(`/social/reviews/${reviewUid}/reply/`, { reply });
    },

    submitReview: async (bookingUid: string, rating: number, comment: string): Promise<any> => {
        return api.post('/social/reviews/', { bookingUid, rating, comment });
    }
};
