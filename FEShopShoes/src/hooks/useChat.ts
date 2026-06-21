import { create } from 'zustand';
import { ChatState, ChatMessage, ChatSession } from '../types/chat';
import { chatSocket } from '../services/chatSocket';
import { ChatApi } from '../api/chatApi';

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  activeSessions: [],
  currentSessionId: null,
  isConnected: false,
  isAiEnabled: true,

  addMessage: (msg) => set((state) => {
    // Tránh thêm trùng tin nhắn dựa trên ID
    if (msg.id && state.messages.find(m => m.id === msg.id)) {
      return state;
    }
    return { messages: [...state.messages, msg] };
  }),

  setMessages: (messages) => set({ messages }),

  setSessions: (sessions) => set({ activeSessions: sessions }),

  setCurrentSession: (userId) => set({ currentSessionId: userId }),

  setConnectionStatus: (status) => set({ isConnected: status }),

  setAiStatus: (status) => set({ isAiEnabled: status })
}));

// --- Helper functions ---

export const connectChat = (token: string, userId: number, role: 'USER' | 'ADMIN') => {
  const { setConnectionStatus, addMessage, setMessages } = useChat.getState();

  // 1. Tải lịch sử chat từ API (Giữ lại catch để xử lý lỗi log)
  ChatApi.getChatHistory(role === 'ADMIN' ? undefined : undefined)
    .then(history => {
      setMessages(history);
    })
    .catch(err => {
      console.error("Lỗi tải lịch sử chat:", err);
    });

  chatSocket.connect(
    token,
    () => {
      setConnectionStatus(true);

      if (role === 'ADMIN') {
        // Đăng ký nhận mọi tin nhắn (dành cho Admin)
        chatSocket.subscribeAdmin((msg) => {
          addMessage(msg);
        });
      } else {
        // Đăng ký nhận tin nhắn riêng của User
        chatSocket.subscribeUser(userId, (msg) => {
          addMessage(msg);
        });
      }
    },
    (err) => {
      setConnectionStatus(false);
      console.error("Chat disconnected:", err);
    }
  );
};

export const disconnectChat = () => {
  chatSocket.disconnect();
  useChat.getState().setConnectionStatus(false);
};

export const sendMessage = (content: string) => {
  if (!content.trim()) return;
  chatSocket.sendMessage(content);
  // Lưu ý: Message thường sẽ được BE trả về qua socket rồi mới addMessage vào UI 
  // để đảm bảo tính đồng bộ (Id, Timestamp chính xác).
};

export const replyToUser = (targetUserId: number, content: string) => {
  if (!content.trim()) return;
  chatSocket.replyToUser(targetUserId, content);
};