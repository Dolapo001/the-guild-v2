import { api } from '../lib/api-client';

export interface FavoriteItem {
  uid: string;
  objectId: string;
  contentType: 'business' | 'service' | 'product';
  contentObject: any;
  isFavorited: boolean;
}

export const socialService = {
    toggleFavorite: async (objectId: string, contentType: 'business' | 'service' | 'product'): Promise<{ isFavorited: boolean }> => {
        const data = await api.post<{ isFavorited: boolean }>('/social/favorites/toggle/', { objectId: objectId, contentType: contentType });
        // Normalize snake_case backend response to camelCase
        return { isFavorited: data.isFavorited };
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

    createReview: async (params: { bookingUid: string, rating: number, comment?: string, images?: string[] }): Promise<any> => {
        return api.post('/social/reviews/', params);
    },

    moderateReview: async (reviewUid: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any> => {
        return api.patch(`/social/reviews/${reviewUid}/moderate/`, { status });
    }
};
