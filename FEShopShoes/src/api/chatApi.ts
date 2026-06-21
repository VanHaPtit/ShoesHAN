import axiosClient from './axiosClient';
import { ChatMessage, ChatSession } from '../types/chat';

export const ChatApi = {
  // Lấy lịch sử tin nhắn của người dùng hiện tại
  getChatHistory: async (userId?: number): Promise<ChatMessage[]> => {
    const url = userId ? `/chat/history/${userId}` : `/chat/history`;
    try {
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history", error);
      return [];
    }
  },

  // Admin bật tắt AI
  toggleAI: async (): Promise<boolean> => {
    try {
      const response = await axiosClient.post('/chat/toggle-ai');
      if (response.data && response.data.includes("true")) return true;
      return false;
    } catch (error) {
      console.error("Error toggling AI", error);
      throw error;
    }
  },

  // (Optional) Lấy danh sách phiên chat cho Admin
  getActiveSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await axiosClient.get('/chat/sessions');
      return response.data;
    } catch (error) {
      console.warn("No session endpoint available or error", error);
      return [];
    }
  }
};
