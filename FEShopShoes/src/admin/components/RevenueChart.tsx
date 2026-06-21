import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useStatisticsStore } from '../../store/statisticsStore';

const RevenueChart: React.FC = () => {
  const { dailyRevenue } = useStatisticsStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-xl shadow-xl border-none outline-none">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-[#0F172A]">Xu hướng doanh thu</h3>
          <p className="text-xs text-gray-400">Biến động doanh thu theo từng ngày</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(value) => `${value/1000000}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="totalRevenue" 
            stroke="#000000" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
