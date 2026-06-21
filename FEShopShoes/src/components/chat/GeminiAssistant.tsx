
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CloseIcon, SearchIcon } from '../common/SimpleIcons';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // 1. Gọi AI lấy câu trả lời
      const aiText = response.text;

      // 2. Lưu vào BE (Yêu cầu bạn tạo thêm ChatController ở BE)
      // Giả sử bạn có api/chat/messages
      await axiosClient.post('/chat/messages', {
        content: aiText,
        sender: "AI",
        session: { id: 1 } // Hardcode hoặc lấy từ state phiên chat
      });

      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      // xử lý lỗi
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] shadow-2xl border-2 border-[#0F172A] flex flex-col transform transition-all duration-300">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold italic uppercase text-xs tracking-widest">SHOES HAN AI ASSISTANT</span>
            </div>
            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-5 h-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <SearchIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase">Hỏi tôi về bất kỳ sản phẩm nào!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-[13px] ${m.role === 'user' ? 'bg-black text-white font-medium' : 'bg-white border border-[#E2E8F0] text-[#0F172A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E2E8F0] p-3 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#E2E8F0] bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ví dụ: Giày chạy bộ tốt nhất?"
                className="flex-grow border border-[#E2E8F0] px-3 py-2 text-xs focus:outline-none focus:border-[#0F172A]"
              />
              <button
                onClick={handleSend}
                className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-gray-800"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <SearchIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
