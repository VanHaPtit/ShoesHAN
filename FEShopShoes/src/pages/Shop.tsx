

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductService } from '../services/ProductService';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Breadcrumb from '../components/common/Breadcrumb';
import { useToast } from '../context/ToastContext';


const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 16;
  const { showToast } = useToast();
  const handledPaymentRef = useRef(false);


  // Quản lý trạng thái bộ lọc giá (Dưới 1tr, 1-3tr, Trên 3tr)
  const [priceFilters, setPriceFilters] = useState<string[]>([]);


  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const paymentStatus = searchParams.get('payment');
  const orderNumber = searchParams.get('order');


  useEffect(() => {
    if (!paymentStatus || handledPaymentRef.current) return;
    handledPaymentRef.current = true;
    if (paymentStatus === 'success') {
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
  }, [paymentStatus, orderNumber, searchParams, setSearchParams, showToast]);


  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let data: Product[];
        if (categoryFilter === 'sale') {
          data = await ProductService.getFlashSales();
        } else if (categoryFilter) {
          data = await ProductService.getByCategory(categoryFilter);
        } else {
          data = await ProductService.getAll();
        }

        let validProducts = data.filter(p => p.active !== false);


        // Client-side search for better matching (word-by-word and accent-insensitive)
        if (searchQuery) {
          const removeAccents = (str: string) => {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          };
          const normalizedQuery = removeAccents(searchQuery.toLowerCase().trim());
          const searchTerms = normalizedQuery.split(/\s+/);

          validProducts = validProducts.filter(product => {
            const nameStr = removeAccents((product.name || '').toLowerCase());
            // Check if all search terms are included in the product name
            return searchTerms.every(term => nameStr.includes(term));
          });
        }


        setProducts(validProducts);
      } catch (err) {
        console.error("Lỗi gọi dữ liệu từ Server:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    setCurrentPage(1);
  }, [categoryFilter, searchQuery]);


  // Xử lý khi click vào checkbox giá
  const handlePriceFilterChange = (range: string) => {
    setPriceFilters(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
    setCurrentPage(1);
  };


  // Logic lọc theo giá TRƯỚC khi sắp xếp
  const filteredByPrice = products.filter(p => {
    if (priceFilters.length === 0) return true;
    const price = p.salePrice || p.basePrice;


    return priceFilters.some(range => {
      if (range === 'Dưới 1tr') return price < 1000000;
      if (range === '1tr - 3tr') return price >= 1000000 && price <= 3000000;
      if (range === 'Trên 3tr') return price > 3000000;
      return false;
    });
  });

  const sortedProducts = [...filteredByPrice].sort((a, b) => {
    const priceA = a.salePrice || a.basePrice;
    const priceB = b.salePrice || b.basePrice;
    if (sort === 'price-low') return priceA - priceB;
    if (sort === 'price-high') return priceB - priceA;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPageTitle = () => {
    if (searchQuery) return `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`;
    if (categoryFilter === 'sale') return "ƯU ĐÃI GIẢM GIÁ";
    if (categoryFilter) return categoryFilter.replace('-', ' ');
    return "TẤT CẢ SẢN PHẨM";
  };


  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Cửa hàng', path: '/shop' }]} />
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {getPageTitle()}
            <span className="text-xl ml-4 font-normal not-italic text-gray-400">({sortedProducts.length})</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <label className="text-xs font-bold uppercase tracking-widest hidden sm:block">Sắp xếp:</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
            className="border-2 border-[#0F172A] px-4 py-2 text-xs font-bold uppercase focus:outline-none appearance-none cursor-pointer hover:bg-black hover:text-white transition-colors"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-low">Giá: Thấp đến Cao</option>
            <option value="price-high">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Danh mục</h3>
            <ul className="space-y-2">
              {['men', 'women', 'sale'].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => { setSearchParams({ category: cat }); setPriceFilters([]); }}
                    className={`text-[13px] font-medium uppercase hover:underline ${categoryFilter === cat ? 'font-black italic underline' : ''}`}
                  >
                    {cat === 'sale' ? 'Giảm giá' : cat}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { setSearchParams({}); setPriceFilters([]); }}
                  className={`text-[13px] font-medium uppercase hover:underline ${!categoryFilter && !searchQuery ? 'font-black italic underline' : ''}`}
                >
                  Tất cả sản phẩm
                </button>
              </li>
            </ul>
          </div>


          <hr className="border-[#E2E8F0]" />


          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Bộ lọc giá</h3>
            <div className="space-y-2">
              {['Dưới 1tr', '1tr - 3tr', 'Trên 3tr'].map(range => (
                <label key={range} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-black cursor-pointer"
                    checked={priceFilters.includes(range)}
                    onChange={() => handlePriceFilterChange(range)}
                  />
                  <span className={`text-[13px] font-medium uppercase ${priceFilters.includes(range) ? 'font-bold' : ''}`}>
                    {range}
                  </span>
                </label>
              ))}
            </div>
            {priceFilters.length > 0 && (
              <button
                onClick={() => setPriceFilters([])}
                className="mt-4 text-[10px] underline uppercase font-bold text-gray-400 hover:text-[#0F172A]"
              >
                Xóa bộ lọc giá
              </button>
            )}
          </div>
        </aside>


        <div className="flex-grow">
          {loading ? (
            <LoadingSpinner />
          ) : sortedProducts.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {paginatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-[#0F172A] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-[13px] font-bold uppercase mx-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-[#0F172A] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0]">
              <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </p>
              <button
                onClick={() => { setSearchParams({}); setPriceFilters([]); }}
                className="mt-4 text-xs font-black underline uppercase"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Shop;



