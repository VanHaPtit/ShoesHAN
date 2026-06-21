import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { useToast } from '../context/ToastContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Đang xác nhận tài khoản của bạn...');

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác nhận. Vui lòng kiểm tra lại đường dẫn trong email của bạn.');
      return;
    }

    const verifyAccount = async () => {
      try {
        const response = await AuthService.verifyEmail(code);
        setStatus('success');
        // Backend trả về chuỗi thông báo hoặc JSON, xử lý hiển thị ở đây
        const successMsg = response.data?.message || response.data || 'Xác nhận tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.';
        setMessage(successMsg);
        showToast('Xác nhận thành công', 'success');
      } catch (error: any) {
        setStatus('error');
        const errorMsg = error.response?.data?.message || error.response?.data || 'Xác nhận thất bại. Link có thể đã hết hạn hoặc không hợp lệ.';
        setMessage(errorMsg);
        showToast('Xác nhận thất bại', 'error');
      }
    };

    verifyAccount();
  }, [code, showToast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border border-[#E2E8F0] text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0F172A] mb-4"></div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#0F172A]">Đang xử lý...</h2>
            <p className="text-gray-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-green-600 mb-2">Thành công!</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all active:scale-[0.98]"
            >
              Đi đến Đăng nhập
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-red-600 mb-2">Thất bại</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gray-200 text-[#0F172A] font-bold uppercase text-sm tracking-widest hover:bg-gray-300 transition-all active:scale-[0.98]"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
