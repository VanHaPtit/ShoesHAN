export interface ChatMessage {
  id?: number | string;

  // Hợp nhất định danh người gửi
  userId?: number;      // Map đúng với backend mới
  senderId?: number;    // Dự phòng cho logic cũ hoặc khách chưa đăng nhập
  senderName?: string;  // Tên hiển thị (nếu có)

  // Hợp nhất vai trò người gửi
  sender?: 'USER' | 'ADMIN' | 'AI';     // Dùng trong HEAD
  senderRole?: 'USER' | 'ADMIN' | 'AI'; // Dùng trong branch cũ

  content: string;
  timestamp?: string;
  isRead?: boolean;
}

export interface ChatSession {
  userId: number;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  activeSessions: ChatSession[];
  currentSessionId: number | null;
  isConnected: boolean;
  isAiEnabled: boolean;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSession: (userId: number | null) => void;
  setConnectionStatus: (status: boolean) => void;
  setAiStatus: (status: boolean) => void;
}