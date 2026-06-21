import React from 'react';
import { useStatisticsStore } from '../../store/statisticsStore';
import { Calendar, Filter } from 'lucide-react';

const DateFilter: React.FC = () => {
  const { filters, setFilters } = useStatisticsStore();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ year: parseInt(e.target.value) });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-[#E2E8F0]">
      <div className="flex items-center gap-2">
        <div className="bg-gray-100 p-2 rounded-xl text-gray-500">
          <Calendar size={18} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleDateChange}
            className="text-sm border-none bg-[#F8FAFC] px-3 py-2 rounded-xl focus:ring-2 focus:ring-black outline-none"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleDateChange}
            className="text-sm border-none bg-[#F8FAFC] px-3 py-2 rounded-xl focus:ring-2 focus:ring-black outline-none"
          />
        </div>
      </div>

      <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

      <div className="flex items-center gap-2">
        <div className="bg-gray-100 p-2 rounded-xl text-gray-500">
          <Filter size={18} />
        </div>
        <select
          value={filters.year}
          onChange={handleYearChange}
          className="text-sm border-none bg-[#F8FAFC] px-4 py-2 rounded-xl focus:ring-2 focus:ring-black outline-none cursor-pointer"
        >
          {years.map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateFilter;
