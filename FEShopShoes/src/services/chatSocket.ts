import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../types/chat';

export type MessageCallback = (msg: ChatMessage) => void;

class ChatSocketService {
  private client: Client | null = null;
  private connected = false;
  private isConnecting = false;

  public connect(token: string, onConnect: () => void, onError: (err: any) => void) {
    // Ngăn chặn việc kết nối chồng chéo nếu đang trong quá trình kết nối hoặc đã kết nối xong
    if (this.connected || this.isConnecting) return;
    this.isConnecting = true;

    // URL Backend - Có thể điều chỉnh qua biến môi trường (env)
    const socketUrl = import.meta.env.VITE_WS_URL;

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connected = true;
      this.isConnecting = false;
      onConnect();
    };

    this.client.onStompError = (frame) => {
      this.connected = false;
      this.isConnecting = false;
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      onError(frame);
    };

    this.client.onWebSocketError = (event) => {
      this.connected = false;
      this.isConnecting = false;
      console.error('WebSocket Error', event);
      onError(event);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      this.isConnecting = false;
    };

    this.client.activate();
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.isConnecting = false;
    }
  }

  // KHÁCH HÀNG: Đăng ký nhận tin nhắn của riêng mình
  public subscribeUser(userId: number, callback: MessageCallback) {
    if (!this.client || !this.connected) return;
    this.client.subscribe(`/topic/user/${userId}`, (message) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    });
  }

  // ADMIN: Đăng ký nhận toàn bộ tin nhắn từ các luồng hỗ trợ
  public subscribeAdmin(callback: MessageCallback) {
    if (!this.client || !this.connected) return;
    this.client.subscribe(`/topic/admin/chat`, (message) => {
      if (message.body) {
        callback(JSON.parse(message.body));
      }
    });
  }

  // KHÁCH HÀNG: Gửi tin nhắn lên hệ thống
  public sendMessage(content: string) {
    if (!this.client || !this.connected) return;
    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({ content })
    });
  }

  // ADMIN: Phản hồi tin nhắn cho một user cụ thể
  public replyToUser(targetUserId: number, content: string) {
    if (!this.client || !this.connected) return;
    this.client.publish({
      destination: '/app/chat.reply',
      body: JSON.stringify({ targetUserId, content })
    });
  }

  public getStatus() {
    return this.connected;
  }
}

export const chatSocket = new ChatSocketService();