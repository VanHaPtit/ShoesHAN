import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStatisticsStore } from '../../store/statisticsStore';

const MonthlyChart: React.FC = () => {
  const { monthlyRevenue } = useStatisticsStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-xl shadow-xl border-none">
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
          <h3 className="text-lg font-black uppercase tracking-widest text-[#0F172A]">Doanh thu theo tháng</h3>
          <p className="text-xs text-gray-400">So sánh hiệu suất giữa các tháng</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb', radius: 10}} />
          <Bar 
            dataKey="totalRevenue" 
            radius={[10, 10, 10, 10]}
            barSize={30}
          >
            {monthlyRevenue.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === monthlyRevenue.length - 1 ? '#000000' : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
