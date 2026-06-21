import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import ProductService from '../services/ProductService';
import { Product } from '../types';

import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerInterval, setBannerInterval] = useState(5000);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { removeFromCart } = useCart();
  const handledPaymentRef = useRef(false);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderNumber = searchParams.get('order');
    if (!paymentStatus || handledPaymentRef.current) return;
    handledPaymentRef.current = true;
    if (paymentStatus === 'success') {
      const checkoutItemsStr = localStorage.getItem('checkoutItems');
      if (checkoutItemsStr) {
        const itemIds: number[] = JSON.parse(checkoutItemsStr);
        itemIds.forEach(id => removeFromCart(id, true));
        localStorage.removeItem('checkoutItems');
      }
      showToast(`Thanh toán thành công đơn hàng ${orderNumber || ''}`, 'success');
    } else if (paymentStatus === 'failed') {
      showToast('Thanh toán thất bại hoặc đã bị hủy.', 'error');
    } else if (paymentStatus === 'error') {
      showToast('Lỗi xử lý thanh toán PayPal.', 'error');
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('payment');
    nextParams.delete('order');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, showToast, removeFromCart]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data: Product[] = await ProductService.getAll();
        setProducts(
          data.filter(product => product.active).slice(0, 8)
        );
      } catch (error) {
        console.error('Lỗi khi tải trang chủ:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const res = await axiosClient.get('/banners/active');
        if (res.data && res.data.length > 0) {
          setBanners(res.data);
        } else {
          setBanners([{
            bannerUrl: '',
            bannerTag: 'SHOES HAN',
            bannerTitle: 'BƯỚC ĐI TỰ TIN',
            bannerHighlight: 'PHONG CÁCH',
            bannerDescription: 'Khám phá bộ sưu tập giày mới nhất với thiết kế hiện đại, thoải mái và bền bỉ.'
          }]);
        }
      } catch (error) {
        console.error('Lỗi khi tải banner:', error);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await axiosClient.get('/config/banner');
        if (res.data && res.data.bannerInterval) {
          setBannerInterval(res.data.bannerInterval);
        }
      } catch (error) {
        console.error('Lỗi tải config:', error);
      }
    };

    fetchProducts();
    fetchBanners();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, bannerInterval);
    return () => clearInterval(interval);
  }, [banners, bannerInterval]);

  const currentBanner = banners[currentBannerIndex] || {
    bannerUrl: '',
    bannerTag: 'SHOES HAN',
    bannerTitle: 'BƯỚC ĐI TỰ TIN',
    bannerHighlight: 'PHONG CÁCH',
    bannerDescription: 'Khám phá bộ sưu tập giày mới nhất với thiết kế hiện đại, thoải mái và bền bỉ.'
  };

  return (
    <div className="space-y-16 pb-20">
      {/* HERO */}
      {(currentBanner.bannerUrl || currentBanner.bannerTitle || currentBanner.bannerTag || currentBanner.bannerDescription) && (
        <section className="relative h-[80vh] w-full overflow-hidden bg-[#f0f2f5] transition-all duration-700 ease-in-out">
          {currentBanner.bannerUrl && (
            <img
              key={currentBanner.bannerUrl}
              src={currentBanner.bannerUrl}
              alt="Hero Banner"
              className="absolute right-0 top-0 w-full md:w-2/3 h-full object-cover object-center md:object-right mix-blend-multiply opacity-95 animate-[fadeIn_0.5s_ease-in-out]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f2f5] via-[#f0f2f5]/90 to-transparent flex items-center">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-10 w-full">
              <div className="max-w-xl space-y-4 animate-[slideRight_0.5s_ease-out]">
                {currentBanner.bannerTag && (
                  <div className="inline-block bg-[#2563EB] text-white px-3 py-1 text-xs font-bold tracking-widest uppercase">
                    {currentBanner.bannerTag}
                  </div>
                )}
                
                {(currentBanner.bannerTitle || currentBanner.bannerHighlight) && (
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-[#1a1a1a]">
                    {currentBanner.bannerTitle} {currentBanner.bannerTitle && currentBanner.bannerHighlight && <br />}
                    <span className="text-[#2563EB]">{currentBanner.bannerHighlight}</span>
                  </h1>
                )}
                
                {currentBanner.bannerDescription && (
                  <p className="text-gray-600 text-base md:text-lg max-w-md pt-2 leading-relaxed font-medium">
                    {currentBanner.bannerDescription}
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link
                    to="/shop"
                    className="bg-[#2563EB] text-white px-8 py-3 font-bold uppercase text-sm hover:bg-[#1D4ED8] transition-all text-center"
                  >
                    MUA NGAY
                  </Link>
                  <Link
                    to="/shop"
                    className="bg-white border-2 border-[#0F172A] text-[#0F172A] px-8 py-3 font-bold uppercase text-sm hover:bg-black hover:text-white transition-all text-center"
                  >
                    KHÁM PHÁ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}



      {/* NEW ARRIVALS */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-10">
        <div className="flex items-end justify-between mb-8 border-b-2 border-[#E2E8F0] pb-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            HÀNG MỚI VỀ
          </h2>
          <Link
            to="/shop"
            className="text-sm font-bold uppercase tracking-widest hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* BRAND MESSAGE */}
      <section className="bg-black text-white py-20">
        <div className="max-w-[800px] mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            YOU GOT THIS
          </h2>
          <p className="text-xl font-medium leading-relaxed opacity-80 italic">
            Khi bạn bỏ qua mọi sự xao nhãng và áp lực, chỉ còn lại bạn và cuộc chơi.
            Hãy tận hưởng từng khoảnh khắc và chinh phục mục tiêu của mình.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-[#ede734] text-[#0F172A] px-12 py-4 font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all"
          >
            KHÁM PHÁ NGAY
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
