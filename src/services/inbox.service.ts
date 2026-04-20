import { api } from '../lib/api-client';
import { Conversation, Message } from '../types/api';

export const inboxService = {
  getConversations: async (): Promise<Conversation[]> => {
    return api.get<Conversation[]>('/inbox/conversations/');
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    return api.get<Message[]>(`/inbox/conversations/${conversationId}/messages/`);
  },

  sendMessage: async (conversationId: string, text: string): Promise<Message> => {
    return api.post<Message>(`/inbox/conversations/${conversationId}/messages/`, { text });
  },

  getSmartReplies: async (conversationId: string): Promise<string[]> => {
    return api.get<string[]>(`/inbox/smart-replies/${conversationId}/`);
  }
};
