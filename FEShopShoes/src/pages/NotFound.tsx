
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-32 text-center space-y-8">
      <h1 className="text-[120px] md:text-[200px] font-black italic uppercase italic tracking-tighter leading-none opacity-10">404</h1>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 pointer-events-none">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 pointer-events-auto">TRANG KHÔNG TỒN TẠI</h2>
        <p className="text-gray-500 font-medium max-w-md italic mb-8 pointer-events-auto">
          Có vẻ như bạn đã đi lạc đường. Đừng lo, chúng tôi sẽ giúp bạn quay lại đường đua.
        </p>
        <Link 
          to="/" 
          className="bg-black text-white px-10 py-4 font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all pointer-events-auto"
        >
          QUAY LẠI TRANG CHỦ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
