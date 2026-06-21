
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/ProductService';
import { ReviewService } from '../services/ReviewService';
import { Product, ProductVariant, Review } from '../types';
import { formatCurrency } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, Package } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc'>('specs');

  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // CẬP NHẬT: Fetch product, variants VÀ reviews cùng lúc
        const [p, v, r] = await Promise.all([
          ProductService.getById(parseInt(id)),
          ProductService.getVariants(parseInt(id)),
          ReviewService.getByProductId(parseInt(id))
        ]);

        if (p.active === false) {
          throw new Error("Sản phẩm không khả dụng");
        }

        setProduct(p);
        setVariants(v);
        setReviews(r.reviews || []); // Lưu reviews vào state
        setAverageRating(r.averageRating || 5);

        if (v.length > 0) {
          setSelectedVariant(v[0]);
          setSelectedSize(v[0].size);
          setSelectedColor(v[0].color);
        }

        if (p.images && p.images.length > 0) {
          setActiveImage(p.images[0]);
        }
      } catch (err) {
        showToast("Sản phẩm hiện tại không khả dụng", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (selectedSize && selectedColor) {
      const match = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      if (match) {
        setSelectedVariant(match);
      } else {
        const firstAvailableColor = variants.find(v => v.size === selectedSize);
        if (firstAvailableColor) {
          setSelectedVariant(firstAvailableColor);
          setSelectedColor(firstAvailableColor.color);
        }
      }
    }
  }, [selectedSize, selectedColor, variants]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (!user) {
      showToast("Vui lòng đăng nhập để mua sắm", "info");
      navigate('/signin');
      return;
    }

    addToCart(product, selectedVariant, quantity);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, "success");
  };

  // Render các ngôi sao đánh giá
  const renderStars = (rating: number, showNumber: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex text-[#facc15] text-[16px] leading-none">
          {[1, 2, 3, 4, 5].map((star) => {
            if (rating >= star) {
              return <span key={star}>★</span>;
            } else if (rating >= star - 0.5) {
              return (
                <div key={star} className="relative inline-block">
                  <span className="text-gray-200">★</span>
                  <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>★</span>
                </div>
              );
            } else {
              return <span key={star} className="text-gray-200">★</span>;
            }
          })}
        </div>
        {showNumber && <span className="text-[13px] font-bold text-gray-700 ml-1 leading-none">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return (
    <div className="p-20 text-center">
      <h2 className="text-2xl font-bold uppercase mb-4 italic tracking-tighter">Sản phẩm không tồn tại</h2>
      <Link to="/shop" className="bg-black text-white px-8 py-3 font-bold uppercase text-xs tracking-widest">Quay lại cửa hàng</Link>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-10 py-10 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16">
        
        {/* TOP LEFT: Image Gallery */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#fcfcfc] rounded-xl border border-[#E2E8F0] aspect-square overflow-hidden w-full relative p-4 shadow-sm">
            <img
              src={activeImage || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mt-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg bg-[#fcfcfc] border-2 transition-all p-1
                  ${activeImage === img ? 'border-[#5a2d2d] shadow-sm' : 'border-[#E2E8F0] opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-contain rounded-md" />
              </button>
            ))}
          </div>
        </div>

        {/* TOP RIGHT: Product Info Sidebar */}
        <div className="lg:col-span-6 h-fit space-y-6">
          <div className="space-y-3">
            <span className="inline-block bg-[#f8f1f0] text-[#5a2d2d] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
              {product.gender} • {product.category?.name || 'Edition'}
            </span>
            <h1 className="text-3xl lg:text-[2.5rem] font-black text-[#3a1d1d] uppercase tracking-tight leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-2 pt-1">
              {renderStars(averageRating, true)}
              <span className="text-[11px] text-gray-500 font-medium">({reviews.length} đánh giá)</span>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <span className="text-3xl font-black text-[#5a2d2d]">
                {formatCurrency(product.salePrice || selectedVariant?.price || product.basePrice)}
              </span>
              {(product.salePrice && product.salePrice < (selectedVariant?.price || product.basePrice)) && (
                <>
                  <span className="text-gray-400 line-through text-lg font-medium">
                    {formatCurrency(selectedVariant?.price || product.basePrice)}
                  </span>
                  <span className="bg-[#3b1c1c] text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                    -{Math.round((1 - product.salePrice / (selectedVariant?.price || product.basePrice)) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-700">Màu sắc</h3>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(variants.map(v => v.color))).map(color => {
                const isAvailableForSize = selectedSize ? variants.some(v => v.color === color && v.size === selectedSize) : true;
                return (
                  <button
                    key={color}
                    disabled={!isAvailableForSize}
                    onClick={() => setSelectedColor(color)}
                    className={`min-w-[4rem] px-4 py-2 rounded-full border text-[11px] font-bold uppercase transition-all
                      ${selectedColor === color ? 'bg-[#5a2d2d] text-white border-[#5a2d2d]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#5a2d2d] hover:text-[#5a2d2d]'}
                      ${!isAvailableForSize ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[11px] uppercase tracking-widest text-gray-700">Kích thước</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(variants.map(v => v.size))).sort((a, b) => Number(a) - Number(b)).map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3.5rem] py-2 rounded-full border border-gray-300 text-xs font-bold transition-all
                    ${selectedSize === size ? 'bg-[#5a2d2d] text-white border-[#5a2d2d]' : 'bg-white text-gray-700 hover:border-[#5a2d2d] hover:text-[#5a2d2d]'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className={`w-full py-4 font-bold uppercase text-sm tracking-widest rounded-md transition-all flex items-center justify-center gap-2
                ${(!selectedVariant || selectedVariant.stock === 0) 
                  ? 'bg-[#e5ddd9] text-[#7a6b68] cursor-not-allowed' 
                  : 'bg-[#5a2d2d] text-white hover:bg-[#3a1d1d] shadow-md hover:shadow-lg'}`}
            >
              {(!selectedVariant || selectedVariant.stock === 0) ? (
                <>
                  <Package size={18} /> HẾT HÀNG
                </>
              ) : (
                'THÊM VÀO GIỎ HÀNG'
              )}
            </button>
            {(!selectedVariant || selectedVariant.stock === 0) && (
              <p className="text-center text-[11px] text-gray-500">Sản phẩm hiện đang tạm hết hàng tại chi nhánh chính.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-3 bg-[#fdfaf9] p-3 rounded-lg border border-[#f5efee]">
              <Truck className="text-[#5a2d2d]" size={20} />
              <div>
                <p className="text-[11px] font-bold text-[#0F172A]">Miễn phí giao hàng</p>
                <p className="text-[9px] text-gray-500">Cho đơn từ 1.000.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#fdfaf9] p-3 rounded-lg border border-[#f5efee]">
              <ShieldCheck className="text-[#5a2d2d]" size={20} />
              <div>
                <p className="text-[11px] font-bold text-[#0F172A]">Bảo hành 12 tháng</p>
                <p className="text-[9px] text-gray-500">Chính hãng Biti's</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT: Tabs & Specs */}
        <div className="lg:col-span-7 pt-4">
          <div className="flex gap-8 border-b border-[#E2E8F0] mb-8">
            <button 
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'specs' ? 'text-[#5a2d2d] border-b-2 border-[#5a2d2d]' : 'text-gray-400 hover:text-gray-600'}`}>
              Thông số chi tiết
            </button>
            <button 
              onClick={() => setActiveTab('desc')}
              className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'desc' ? 'text-[#5a2d2d] border-b-2 border-[#5a2d2d]' : 'text-gray-400 hover:text-gray-600'}`}>
              Mô tả
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="space-y-2 mb-10">
              {product.material && (
                <div className="grid grid-cols-[150px_1fr] p-3 bg-[#fbf7f6] rounded-md text-[13px]">
                  <span className="font-bold text-gray-500">CHẤT LIỆU</span>
                  <span className="text-[#0F172A]">{product.material}</span>
                </div>
              )}
              {product.soleType && (
                <div className="grid grid-cols-[150px_1fr] p-3 text-[13px]">
                  <span className="font-bold text-gray-500">ĐẾ GIÀY</span>
                  <span className="text-[#0F172A]">{product.soleType}</span>
                </div>
              )}
              {product.gender && (
                <div className="grid grid-cols-[150px_1fr] p-3 bg-[#fbf7f6] rounded-md text-[13px]">
                  <span className="font-bold text-gray-500">GIỚI TÍNH</span>
                  <span className="text-[#0F172A]">{product.gender}</span>
                </div>
              )}
              {product.origin && (
                <div className="grid grid-cols-[150px_1fr] p-3 text-[13px]">
                  <span className="font-bold text-gray-500">XUẤT XỨ</span>
                  <span className="text-[#0F172A]">{product.origin}</span>
                </div>
              )}
              {!product.material && !product.soleType && !product.gender && !product.origin && (
                <p className="text-sm italic text-gray-400">Không có thông số chi tiết cho sản phẩm này.</p>
              )}
            </div>
          )}

          {activeTab === 'desc' && (
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-50">
              <h3 className="text-xl font-bold text-[#3a1d1d] mb-4">Chi Tiết Sản Phẩm</h3>
              <p className="text-[13px] leading-relaxed text-gray-600 mb-4 whitespace-pre-wrap">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM RIGHT: Reviews */}
        <div className="lg:col-span-5 pt-4">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] mb-8 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#5a2d2d]">
              Đánh giá
            </h3>
            <button className="text-[11px] font-bold text-gray-600 hover:text-[#0F172A]">Xem tất cả ({reviews.length})</button>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-sm italic text-gray-400">Hiện chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#5a2d2d] flex items-center justify-center text-white font-bold text-sm uppercase">
                      {review.username ? review.username.substring(0, 2) : "U"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#3a1d1d] uppercase">{review.username}</p>
                      <p className="text-[10px] text-gray-400">Đã mua hàng</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-[13px] text-gray-600 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 flex-shrink-0 border border-[#E2E8F0] cursor-pointer hover:border-[#0F172A] transition-colors">
                          <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-[10px] text-gray-400 mt-4">{review.createdAt}</p>
                </div>
              ))
            )}

            {/* Write Review Prompt */}
            <div className="mt-8 border border-dashed border-[#5a2d2d] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#fdfaf9]">
              <p className="text-xs text-gray-600 mb-4">Bạn đã trải nghiệm sản phẩm này và muốn đánh giá?</p>
              <p className="text-[10px] text-gray-400 mb-6 max-w-sm">
                * Chỉ những khách hàng đã mua sản phẩm (Đơn hàng thành công) mới có thể viết đánh giá để đảm bảo tính minh bạch.
              </p>
              <button 
                onClick={() => navigate('/profile/orders')}
                className="bg-[#5a2d2d] text-white px-8 py-3 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-[#3a1d1d] transition-colors shadow-md"
              >
                Vào lịch sử đơn hàng
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;