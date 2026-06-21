import React, { useState } from 'react';
import { ChatApi } from '../../api/chatApi';
import { useChat } from '../../hooks/useChat';

const ToggleAIButton: React.FC = () => {
  const { isAiEnabled, setAiStatus } = useChat();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const status = await ChatApi.toggleAI();
      setAiStatus(status);
    } catch (error) {
      alert('Không thể thay đổi trạng thái AI. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#0F172A]">AI Auto-Reply</span>
        <span className="text-xs text-gray-500">
          {isAiEnabled ? 'Đang tự động trả lời khách hàng' : 'Đã tắt tự động trả lời'}
        </span>
      </div>
      
      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          isAiEnabled ? 'bg-green-500' : 'bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="sr-only">Toggle AI</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAiEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleAIButton;
