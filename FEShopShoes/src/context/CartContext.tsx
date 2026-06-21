import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { generateId } from '../utils/format';
import axiosClient from '../api/axiosClient';
import PaymentService from '../services/PaymentService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

/* ================= TYPES ================= */

interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  token: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number, silent?: boolean) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  checkoutWithVNPay: () => Promise<void>;
  fetchUserCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  /* ===== 1. FETCH CART FROM DB ===== */
  const fetchUserCartFromDB = useCallback(async (userId?: number) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/carts/user/${userId}`);
      setCart(res.data?.items || res.data?.cartItems || []);
    } catch (err) {
      console.error('Lỗi fetch giỏ hàng:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ===== 2. CHECK AUTH ON LOAD ===== */
  useEffect(() => {
    if (user) {
      fetchUserCartFromDB(user.id);
    } else {
      const savedCart = localStorage.getItem('adidas_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    }
  }, [user, fetchUserCartFromDB]);

  /* ===== 3. ADD TO CART ===== */
  const addToCart = useCallback(async (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "info");
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }
    try {
      const payload = {
        variant: { id: variant.id },
        quantity,
        price: product.salePrice || product.basePrice
      };
      await axiosClient.post('/cart-items', payload);
      await fetchUserCartFromDB(user.id);
      showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    } catch {
      showToast("Không thể thêm vào giỏ hàng", "error");
    }
  }, [user, navigate, showToast, fetchUserCartFromDB]);

  /* ===== 4. UPDATE QUANTITY ===== */
  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    if (user) {
      try {
        await axiosClient.put(`/cart-items/${itemId}`, { quantity });
        await fetchUserCartFromDB(user.id);
      } catch {
        showToast("Lỗi cập nhật số lượng", "error");
      }
    } else {
      setCart(prev => {
        const newCart = prev.map(i => i.id === itemId ? { ...i, quantity } : i);
        localStorage.setItem('adidas_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [user, fetchUserCartFromDB, showToast]);

  /* ===== 5. REMOVE ITEM ===== */
  const removeFromCart = useCallback(async (itemId: number, silent: boolean = false) => {
    if (user) {
      try {
        await axiosClient.delete(`/cart-items/${itemId}`);
        await fetchUserCartFromDB(user.id);
        if (!silent) showToast("Đã xóa sản phẩm", "info");
      } catch {
        if (!silent) showToast("Lỗi xóa sản phẩm", "error");
      }
    } else {
      setCart(prev => {
        const newCart = prev.filter(i => i.id !== itemId);
        localStorage.setItem('adidas_cart', JSON.stringify(newCart));
        return newCart;
      });
      if (!silent) showToast("Đã xóa sản phẩm", "info");
    }
  }, [user, fetchUserCartFromDB, showToast]);

  /* ===== 6. PAYMENT LOGIC ===== */
  const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shippingFee = totalAmount > 1500000 || totalAmount === 0 ? 0 : 50000;
  const finalAmount = totalAmount + shippingFee;

  const checkoutWithVNPay = useCallback(async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thanh toán", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await PaymentService.createPaymentUrl(finalAmount);
      if (response && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      showToast("Lỗi khởi tạo thanh toán VNPay", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user, finalAmount, showToast]);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('adidas_cart');
  };

  return (
    <CartContext.Provider value={{
      cart, 
      addToCart,    
      removeFromCart,  
      updateQuantity,  
      clearCart, 
      totalAmount, 
      shippingFee, 
      finalAmount, 
      checkoutWithVNPay,
      fetchUserCart: () => fetchUserCartFromDB(user?.id), 
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
