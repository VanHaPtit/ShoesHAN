import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#0F172A]">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 font-bold flex items-center ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
            <span className="text-gray-400 font-normal ml-1">so với kỳ trước</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
