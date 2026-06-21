import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { useToast } from '../context/ToastContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword(email);
      showToast(response.data || "Mật khẩu mới đã được gửi đến email của bạn.", "success");
      navigate('/signin');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMsg = err.response?.data || "Không thể gửi yêu cầu khôi phục mật khẩu.";
      showToast(typeof errorMsg === 'string' ? errorMsg : "Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border border-[#E2E8F0]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold uppercase italic tracking-tighter">
            Khôi Phục Mật Khẩu
          </h2>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">Shoes Han Official Store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Địa chỉ Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-[#F8FAFC] border ${error ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
              placeholder="name@example.com"
            />
            {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 mt-6"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : "Gửi Yêu Cầu"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/signin')}
            className="text-[11px] font-black uppercase underline tracking-widest hover:text-gray-600"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
