import React from 'react';
import { useStatisticsStore } from '../../store/statisticsStore';
import { ShoppingBag, TrendingUp } from 'lucide-react';

const TopProducts: React.FC = () => {
  const { topProducts } = useStatisticsStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-[#0F172A]">Sản phẩm bán chạy</h3>
          <p className="text-xs text-gray-400">Top 5 sản phẩm đạt doanh thu cao nhất</p>
        </div>
        <div className="bg-black text-white p-2 rounded-xl">
          <TrendingUp size={16} />
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
            <ShoppingBag size={48} className="mb-2" />
            <p className="text-sm">Không có dữ liệu sản phẩm</p>
          </div>
        ) : (
          topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] transition-colors group">
              <div className="relative">
                <img 
                  src={product.image || 'https://placehold.co/60x60?text=Shoe'} 
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0]"
                />
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {index + 1}
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#0F172A]">{product.name}</h4>
                <p className="text-xs text-gray-500 font-medium">{product.totalSold} đôi đã bán</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#0F172A]">{formatCurrency(product.totalRevenue)}</p>
                <div className="mt-1 h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full" 
                    style={{ width: `${Math.min(100, (product.totalSold / (topProducts[0]?.totalSold || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopProducts;
