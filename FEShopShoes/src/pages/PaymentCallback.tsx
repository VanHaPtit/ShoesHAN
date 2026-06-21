import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { removeFromCart } = useCart();
  const { showToast } = useToast();

  const handledRef = React.useRef(false);

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    
    if (handledRef.current || !responseCode) return;
    handledRef.current = true;

    if (responseCode === '00') {
      const checkoutItemsStr = localStorage.getItem('checkoutItems');
      if (checkoutItemsStr) {
        const itemIds: number[] = JSON.parse(checkoutItemsStr);
        itemIds.forEach(id => removeFromCart(id, true));
        localStorage.removeItem('checkoutItems');
      }
      showToast("Thanh toán đơn hàng thành công!", "success");
      navigate('/profile'); // Chuyển về trang cá nhân
    } else {
      showToast("Giao dịch thất bại hoặc đã bị hủy.", "error");
      navigate('/cart');
    }
  }, [searchParams, navigate, removeFromCart, showToast]);

  return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F172A] mb-4"></div>
      <h2 className="font-black italic uppercase tracking-tighter text-2xl">Đang xác thực giao dịch...</h2>
    </div>
  );
};

export default PaymentCallback;