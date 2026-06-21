import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat, connectChat, replyToUser } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from '../../components/chat/MessageBubble';
import ToggleAIButton from './ToggleAIButton';
import axiosClient from '../../api/axiosClient';

const AdminChatPanel: React.FC = () => {
  const { user } = useAuth();
  const { messages, isConnected } = useChat();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [usersInfo, setUsersInfo] = useState<Record<number, { name: string; avatar: string }>>({});

  const getInitials = (name: string) => {
      if (!name) return 'U';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
      axiosClient.get('/users')
          .then(res => {
              const users = res.data || [];
              const infoMap: Record<number, { name: string; avatar: string }> = {};
              users.forEach((u: any) => {
                  infoMap[u.id] = {
                      name: u.fullName || u.username,
                      avatar: u.imageAvt || ''
                  };
              });
              setUsersInfo(infoMap);
          })
          .catch(err => console.error("Lỗi tải thông tin users", err));
  }, []);

  // 1. Kết nối WebSockets khi vào trang Admin
  useEffect(() => {
    if (user && !isConnected) {
      const token = user.token || user.accessToken;
      if (token) {
        connectChat(token, user.id, 'ADMIN');
      }
    }
  }, [user, isConnected]);

  // 2. Tự động cuộn xuống cuối khi có tin nhắn mới hoặc đổi User
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedUserId]);

  // 3. Lọc danh sách User duy nhất từ lịch sử tin nhắn (Dùng useMemo để tối ưu)
  const uniqueUsers = useMemo(() => {
    const users = messages
      .filter(m => m.senderRole === 'USER' || m.userId)
      .map(m => m.senderId || m.userId);
    return Array.from(new Set(users)).filter(Boolean) as number[];
  }, [messages]);

  // 4. Lọc tin nhắn của user đang được chọn
  const currentMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages.filter(
      msg => msg.userId === selectedUserId || msg.senderId === selectedUserId || (msg.receiverId === selectedUserId && msg.senderRole === 'ADMIN')
    );
  }, [messages, selectedUserId]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedUserId || !isConnected) return;
    replyToUser(selectedUserId, replyText);
    setReplyText('');
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">

      {/* Sidebar: Danh sách User */}
      <div className="w-1/3 border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC]">
        <div className="p-4 border-b border-[#E2E8F0] bg-white">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">CUSTOMER SUPPORT</h2>
          <div className="mt-4">
            <ToggleAIButton />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {uniqueUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Chưa có cuộc hội thoại nào.</div>
          ) : (
            uniqueUsers.map(uid => {
              const uInfo = usersInfo[uid] || { name: `Khách hàng #${uid}`, avatar: '' };
              return (
                <div
                  key={uid}
                  onClick={() => setSelectedUserId(uid)}
                  className={`p-4 border-b border-[#E2E8F0] cursor-pointer transition-colors ${
                    selectedUserId === uid ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {uInfo.avatar ? (
                        <img src={uInfo.avatar} alt="avt" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {getInitials(uInfo.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{uInfo.name}</h4>
                        <p className="text-xs text-gray-500 truncate w-32">Nhấn để xem tin nhắn...</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Khung Chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3">
                {usersInfo[selectedUserId]?.avatar ? (
                    <img src={usersInfo[selectedUserId].avatar} alt="avt" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {getInitials(usersInfo[selectedUserId]?.name || `Khách hàng #${selectedUserId}`)}
                    </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800">{usersInfo[selectedUserId]?.name || `Khách hàng #${selectedUserId}`}</h3>
                  <div className="text-xs text-green-500 font-medium flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Đang xem
                  </div>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
              {currentMessages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id || idx}
                  message={msg}
                  isOwnMessage={msg.senderRole === 'ADMIN' || msg.sender === 'ADMIN'}
                />
              ))}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-white">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleReply()}
                  placeholder="Nhập câu trả lời..."
                  className="flex-grow px-4 py-3 bg-gray-100 border-transparent rounded-xl focus:border-[#0F172A] focus:ring-0 focus:bg-white transition-colors"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Gửi
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">Chọn một khách hàng để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;