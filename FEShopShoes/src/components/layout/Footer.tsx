
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const sections = [
    {
      title: "Sản Phẩm",
      links: ["Giày Nam", "Giày Nữ", "Giày Unisex", "Bộ sưu tập mới", "Sản phẩm Sale"]
    },
    {
      title: "Hỗ Trợ Khách Hàng",
      links: ["Trợ giúp & FAQs", "Theo dõi đơn hàng", "Chính sách vận chuyển", "Chính sách đổi trả", "Hướng dẫn chọn Size"]
    },
    {
      title: "Về Chúng Tôi",
      links: ["Giới thiệu thương hiệu", "Tin tức & Sự kiện", "Hệ thống cửa hàng", "Cơ hội nghề nghiệp"]
    }
  ];

  const contactInfo = [
    { icon: "📍", text: "Hoàn Kiếm , Hà Nội" },
    { icon: "📞", text: "Hotline: 1900 1234" },
    { icon: "✉️", text: "Email: cskh@adidas.vn" },
    { icon: "⏰", text: "Giờ mở cửa: 8:00 - 22:00" }
  ];

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="bg-[#ede734] py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-black italic uppercase text-[#0F172A] tracking-tighter">
            TRỞ THÀNH HỘI VIÊN & NHẬN ƯU ĐÃI 15%
          </h2>
          <Link
            to="/register"
            className="bg-black text-white px-8 py-4 font-bold uppercase text-sm hover:opacity-80 transition-all flex items-center"
          >
            Đăng ký miễn phí <span className="ml-2 text-xl">→</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h4 className="font-bold text-sm uppercase italic tracking-tighter text-white">{section.title}</h4>
            <ul className="space-y-3">
              {section.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link to="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase italic tracking-tighter text-white">Thông Tin Liên Hệ</h4>
          <ul className="space-y-3">
            {contactInfo.map((info, idx) => (
              <li key={idx} className="flex items-start text-[13px] text-gray-400 gap-2">
                <span className="text-sm">{info.icon}</span>
                <span>{info.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <h4 className="font-bold text-sm uppercase italic tracking-tighter text-white">Kết Nối Với Chúng Tôi</h4>
          <div className="flex space-x-3">
            {['facebook', 'instagram', 'twitter', 'youtube'].map(social => (
              <a key={social} href="#" className="w-10 h-10 border border-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <span className="sr-only">{social}</span>
                <i className={`fab fa-${social}`}></i>
              </a>
            ))}
          </div>
          <div className="pt-4">
            <h4 className="font-bold text-sm uppercase italic tracking-tighter text-white mb-3">Thanh Toán An Toàn</h4>
            <div className="flex gap-2">
              {/* Thêm một số text giả lập logo thanh toán */}
              <span className="px-3 py-1 bg-white text-black text-[10px] font-bold rounded">VISA</span>
              <span className="px-3 py-1 bg-white text-black text-[10px] font-bold rounded">MASTER</span>
              <span className="px-3 py-1 bg-[#003087] text-white text-[10px] font-bold rounded">PAYPAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-[11px] text-gray-500 uppercase font-bold tracking-widest px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8">
          <Link to="/privacy" className="hover:underline">Chính sách Bảo mật</Link>
          <Link to="/terms" className="hover:underline">Điều khoản và Điều kiện</Link>
          <Link to="/legal" className="hover:underline">Thông tin pháp lý</Link>
          <span>© 2026 adidas Vietnam Company Limited</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
