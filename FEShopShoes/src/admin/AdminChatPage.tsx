import React from 'react';
import AdminChatPanel from './components/AdminChatPanel';

const AdminChatPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">CUSTOMER SUPPORT</h1>
        <p className="text-gray-500 mt-1">Theo dõi, phản hồi tin nhắn của khách hàng và quản lý AI tự động.</p>
      </div>
      
      <AdminChatPanel />
    </div>
  );
};

export default AdminChatPage;
