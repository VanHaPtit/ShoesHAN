import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat, connectChat, disconnectChat, sendMessage } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import { CloseIcon, SearchIcon } from '../common/SimpleIcons';

const CustomerChatBox: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lấy dữ liệu từ Zustand store
  const { messages, isConnected } = useChat();

  // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc khi mở box
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Kết nối WebSockets khi mở chat và đã đăng nhập
  useEffect(() => {
    if (isOpen && user && !isConnected) {
      const token = user.token || user.accessToken;
      if (token) {
        connectChat(token, user.id, 'USER');
      }
    }
  }, [isOpen, user, isConnected]);

  const handleSend = () => {
    if (!query.trim() || !isConnected) return;
    sendMessage(query);
    setQuery('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] shadow-2xl border border-[#E2E8F0] rounded-2xl flex flex-col overflow-hidden transform transition-all duration-300">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">AI</span>
                </div>
                {isConnected ? (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0F172A]"></div>
                ) : (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-[#0F172A] animate-pulse"></div>
                )}
              </div>
              <div>
                <div className="font-bold text-sm tracking-widest">SHOES HAN SUPPORT</div>
                <div className="text-[10px] text-gray-400">{isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-2 bg-[#F8FAFC] flex flex-col">
            {messages.length === 0 && (
              <div className="text-center my-auto py-10 opacity-50">
                <SearchIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-bold uppercase text-gray-500">Hỏi tôi về bất kỳ sản phẩm nào!</p>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg text-center mb-4">
                Bạn cần <a href="/signin" className="font-bold underline">Đăng nhập</a> để sử dụng tính năng Chat Realtime.
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id || idx}
                message={msg}
                // Hợp nhất logic xác định tin nhắn của mình
                isOwnMessage={msg.sender === 'USER' || msg.senderId === user?.id || msg.senderRole === 'USER'}
              />
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder={isConnected ? "Nhập tin nhắn..." : "Vui lòng chờ kết nối..."}
                disabled={!isConnected || !user}
                className="flex-grow px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!isConnected || !query.trim() || !user}
                className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-45 -mt-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative group"
        >
          <SearchIcon className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
            Chat
          </span>
        </button>
      )}
    </div>
  );
};

export default CustomerChatBox;