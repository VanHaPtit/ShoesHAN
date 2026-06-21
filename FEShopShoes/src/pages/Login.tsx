




import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/signin');

  useEffect(() => {
    setIsLogin(location.pathname === '/signin');
  }, [location.pathname]);

  // States cho các trường dữ liệu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (!isLogin) {
        // LUỒNG ĐĂNG KÝ: Gửi toàn bộ thông tin cho BE
        const signupData = {
          username: email,
          email,
          password,
          fullName,
          phone,
          dateOfBirth,
          role: ["USER"]
        };
        await AuthService.register(signupData);
        showToast("Vui lòng kiểm tra email của bạn và nhấn vào liên kết xác nhận để hoàn tất đăng ký", "success");
        setIsLogin(true); // Chuyển về form đăng nhập
        navigate('/signin');
      } else {
        // LUỒNG ĐĂNG NHẬP: Sử dụng Email làm username để xác thực
        const response = await AuthService.login({ username: email, password });

        // Lưu thông tin vào Context & LocalStorage
        login(response.data);
        showToast("Chào mừng bạn quay trở lại!", "success");

        // Kiểm tra quyền Admin để điều hướng
        const isAdmin = response.data?.roles?.includes('ROLE_ADMIN') || response.data?.roles?.some((r: any) => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN');
        navigate(isAdmin ? '/admin' : '/shop');
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.fieldErrors) {
        // Lỗi validation từ BE (GlobalExceptionHandler)
        setErrors(err.response.data.fieldErrors);
        showToast("Vui lòng kiểm tra lại thông tin nhập", "error");
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data || "Thông tin không chính xác, vui lòng thử lại.";
        showToast(typeof errorMsg === 'string' ? errorMsg : "Có lỗi xảy ra", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border border-[#E2E8F0]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold uppercase italic tracking-tighter">
            {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </h2>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">Shoes Han Official Store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Địa chỉ Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-[#F8FAFC] border ${errors.email || errors.username ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
              placeholder="name@example.com"
            />
            {(errors.email || errors.username) && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email || errors.username}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-[#F8FAFC] border ${errors.password ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#0F172A]"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.password}</p>}
          </div>

          {/* Quên mật khẩu */}
          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] font-black uppercase text-gray-400 hover:text-black tracking-[0.05em] transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* Các trường bổ sung khi Đăng ký */}
          {!isLogin && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#F8FAFC] border ${errors.fullName ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
                />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#F8FAFC] border ${errors.phone ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 ml-1">Ngày sinh</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#F8FAFC] border ${errors.dateOfBirth ? 'border-red-500' : 'border-[#E2E8F0]'} focus:border-[#0F172A] outline-none transition-all font-bold`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.dateOfBirth}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 mt-6"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(isLogin ? '/signup' : '/signin')}
            className="text-[11px] font-black uppercase underline tracking-widest hover:text-gray-600"
          >
            {isLogin ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;