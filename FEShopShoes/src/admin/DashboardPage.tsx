import React from 'react';
import { useStatistics } from '../hooks/useStatistics';
import { useStatisticsStore } from '../store/statisticsStore';
import StatCard from './components/StatCard';
import DateFilter from './components/DateFilter';
import RevenueChart from './components/RevenueChart';
import MonthlyChart from './components/MonthlyChart';
import TopProducts from './components/TopProducts';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { isLoading, summaryStats } = useStatisticsStore();
  useStatistics(); // Fetch data on mount and when filters change

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="p-6 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">DASHBOARD STATISTICS</h1>
          <p className="text-gray-500 font-medium">Theo dõi hoạt động kinh doanh của cửa hàng</p>
        </div>
        <DateFilter />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F172A]"></div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="TỔNG DOANH THU" 
          value={formatCurrency(summaryStats?.totalRevenue || 0)} 
          icon={<DollarSign size={24} />} 
          color="green"
        />
        <StatCard 
          title="TỔNG ĐƠN HÀNG" 
          value={summaryStats?.totalOrders || 0} 
          icon={<ShoppingCart size={24} />} 
          color="blue"
        />
        <StatCard 
          title="KHÁCH HÀNG MỚI" 
          value={summaryStats?.newCustomers || 0} 
          icon={<Users size={24} />} 
          color="purple"
        />
        <StatCard 
          title="TỒN KHO" 
          value={summaryStats?.totalStock || 0} 
          icon={<Package size={24} />} 
          color="orange"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <MonthlyChart />
        </div>
        <div className="lg:col-span-1">
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
