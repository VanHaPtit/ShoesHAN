
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AdidasLogo, SearchIcon, UserIcon, CartIcon, MenuIcon, CloseIcon } from '../common/SimpleIcons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // So sánh pathname + query để xác định active
  const isActive = (path: string, search?: string) => {
    if (search) {
      return location.pathname === path && location.search.includes(search);
    }
    // /shop không có query mới match
    return location.pathname === path && !location.search;
  };

  // Desktop: active → chữ đỏ + border-bottom đỏ; không active → chữ đen (hoặc đỏ nếu isRed)
  const desktopLinkClass = (active: boolean, isRed = false) =>
    `h-full flex items-center px-1 border-b-4 transition-colors duration-150 font-bold uppercase text-[14px] tracking-widest ${active
      ? 'border-red-600 text-red-600'
      : `border-transparent hover:border-[#0F172A] ${isRed ? 'text-red-600' : 'text-[#0F172A]'}`
    }`;

  // Mobile: active → chữ đỏ
  const mobileLinkClass = (active: boolean, isRed = false) =>
    active || isRed ? 'text-red-600' : '';

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/shop', label: 'GIÀY', search: undefined, isRed: false },
    { to: '/shop?category=men', label: 'NAM', search: 'category=men', isRed: false },
    { to: '/shop?category=women', label: 'NỮ', search: 'category=women', isRed: false },
    { to: '/shop?category=sale', label: 'GIẢM GIÁ', search: 'category=sale', isRed: false },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold h-8 flex items-center justify-center uppercase tracking-widest px-4 text-center">
        Trả hàng dễ dàng và miễn phí | Giao hàng nhanh toàn quốc
      </div>

      <nav className="border-b border-[#E2E8F0]">
        <div className="hidden lg:flex max-w-[1400px] mx-auto px-10 justify-end items-center space-x-6 h-8 text-[11px] text-gray-600 font-medium">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="mr-4 px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded hover:bg-black transition-all"
                >
                  TRANG QUẢN TRỊ
                </Link>
              )}
              <span className="font-bold text-[#0F172A] italic">
                XIN CHÀO, {user.fullName?.toUpperCase()}
              </span>
              <button onClick={handleLogout} className="hover:underline text-red-600 font-bold">
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/signin" className="hover:underline">Đăng ký / Đăng nhập</Link>
          )}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-10 flex items-center justify-between h-14 md:h-20">
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon />
          </button>

          <Link to="/" className="flex-shrink-0">
            <span className="text-red-600 font-black text-xl md:text-2xl tracking-tighter uppercase">SHOES HAN</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center space-x-8 h-full">
            {navLinks.map(({ to, label, search, isRed }) => (
              <Link
                key={to}
                to={to}
                className={desktopLinkClass(isActive('/shop', search), isRed)}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <form onSubmit={handleSearch} className="relative group hidden md:block">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="bg-[#f3f4f6] px-4 py-2 text-sm focus:outline-none w-40 lg:w-64 pr-10 rounded-full border border-transparent focus:border-gray-300 transition-all text-gray-700"
              />
              <button type="submit" className="absolute right-3 top-2 text-gray-500 hover:text-[#0F172A] transition-colors"><SearchIcon className="w-5 h-5" /></button>
            </form>
            <Link to={user ? "/profile" : "/signin"} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
              {user?.imageAvt ? (
                <img src={user.imageAvt} alt="User Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <UserIcon />
              )}
            </Link>
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <CartIcon count={cartCount} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[100] p-6 lg:hidden overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <span className="text-red-600 font-black text-2xl tracking-tighter uppercase">SHOES HAN</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col space-y-6 text-2xl font-black italic uppercase">
            {user && <div className="text-sm not-italic text-gray-500">Chào, {user.fullName}</div>}
            {isAdmin && (
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="text-red-600">
                Quản trị hệ thống
              </Link>
            )}
            {navLinks.map(({ to, label, search, isRed }) => (
              <Link
                key={to}
                onClick={() => setIsMobileMenuOpen(false)}
                to={to}
                className={mobileLinkClass(isActive('/shop', search), isRed)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;











// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AdidasLogo, SearchIcon, UserIcon, CartIcon, MenuIcon, CloseIcon } from '../common/SimpleIcons';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext'; // Sử dụng Context mới

// const Navbar: React.FC = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { user, logout } = useAuth(); // Lấy thông tin user từ AuthContext
//   const { cart } = useCart();
//   const navigate = useNavigate();

//   const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

//   // Kiểm tra quyền Admin (role_id = 2 hoặc ROLE_ADMIN)
//   const isAdmin = user?.roles?.includes('ROLE_ADMIN');

//   const handleLogout = () => {
//     if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
//       logout();
//       setIsMobileMenuOpen(false);
//       navigate('/');
//     }
//   };

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
//       setSearchTerm('');
//       setIsMobileMenuOpen(false);
//     }
//   };

//   return (
//     <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
//       <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold h-8 flex items-center justify-center uppercase tracking-widest px-4 text-center">
//         Trả hàng dễ dàng và miễn phí | Giao hàng nhanh toàn quốc
//       </div>

//       <nav className="border-b border-[#E2E8F0]">
//         <div className="hidden lg:flex max-w-[1400px] mx-auto px-10 justify-end items-center space-x-6 h-8 text-[11px] text-gray-600 font-medium">
//           {/* <Link to="/orders" className="hover:underline">Đơn hàng</Link> */}

//           {user ? (
//             <>
//               {/* Nút truy cập nhanh vào Admin cho người có quyền */}
//               {isAdmin && (
//                 <Link
//                   to="/admin"
//                   className="mr-4 px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded hover:bg-black transition-all"
//                 >
//                   TRANG QUẢN TRỊ
//                 </Link>
//               )}
//               <span className="font-bold text-[#0F172A] italic">
//                 XIN CHÀO, {user.fullName?.toUpperCase()}
//               </span>
//               <button onClick={handleLogout} className="hover:underline text-red-600 font-bold">Đăng xuất</button>
//             </>
//           ) : (
//             <>
//               <Link to="/signin" className="hover:underline">Đăng ký / Đăng nhập</Link>
//             </>
//           )}
//           <div className="font-bold text-[#0F172A]">VN</div>
//         </div>

//         <div className="max-w-[1400px] mx-auto px-4 lg:px-10 flex items-center justify-between h-14 md:h-20">
//           <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
//             <MenuIcon />
//           </button>

//           <Link to="/" className="flex-shrink-0">
//             <AdidasLogo className="w-12 h-8 md:w-16 md:h-12 text-[#0F172A]" />
//           </Link>

//           <div className="hidden lg:flex items-center space-x-8 font-bold uppercase text-[14px] tracking-widest h-full">
//             <Link to="/shop" className="hover:border-b-4 border-[#0F172A] h-full flex items-center px-1">Giày</Link>
//             <Link to="/shop?category=men" className="hover:border-b-4 border-[#0F172A] h-full flex items-center px-1">Nam</Link>
//             <Link to="/shop?category=women" className="hover:border-b-4 border-[#0F172A] h-full flex items-center px-1">Nữ</Link>
//             <Link to="/shop?category=sale" className="text-red-600 hover:border-b-4 border-[#0F172A] h-full flex items-center px-1">Giảm Giá</Link>
//           </div>

//           <div className="flex items-center space-x-2 md:space-x-4">
//             <form onSubmit={handleSearch} className="relative group hidden md:block">
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Tìm kiếm"
//                 className="bg-[#eceff1] px-3 py-2 text-sm focus:outline-none w-40 lg:w-48 pr-10 border-b-2 border-transparent focus:border-[#0F172A] transition-all"
//               />
//               <button type="submit" className="absolute right-2 top-2"><SearchIcon /></button>
//             </form>
//             <Link to={user ? "/profile" : "/signin"} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><UserIcon /></Link>
//             <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors"><CartIcon count={cartCount} /></Link>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 bg-white z-[100] p-6 lg:hidden overflow-y-auto flex flex-col">
//           <div className="flex justify-between items-center mb-10">
//             <AdidasLogo className="w-12 h-8" />
//             <button onClick={() => setIsMobileMenuOpen(false)}><CloseIcon className="w-8 h-8" /></button>
//           </div>
//           <div className="flex flex-col space-y-6 text-2xl font-black italic uppercase">
//             {user && <div className="text-sm not-italic text-gray-500">Chào, {user.fullName}</div>}
//             {isAdmin && <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="text-red-600">Quản trị hệ thống</Link>}
//             <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop">Giày</Link>
//             <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?category=men">Nam</Link>
//             <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?category=women">Nữ</Link>
//             <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?category=sale" className="text-red-600">Giảm Giá</Link>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Navbar;