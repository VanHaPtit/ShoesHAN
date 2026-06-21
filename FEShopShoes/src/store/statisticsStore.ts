import { create } from 'zustand';
import { RevenueData, TopProduct } from '../api/statisticsApi';

export interface SummaryStats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  totalStock: number;
}

interface StatisticsState {
  dailyRevenue: RevenueData[];
  monthlyRevenue: RevenueData[];
  topProducts: TopProduct[];
  summaryStats: SummaryStats | null;
  isLoading: boolean;
  error: string | null;
  
  filters: {
    startDate: string;
    endDate: string;
    year: number;
  };

  setDailyRevenue: (data: RevenueData[]) => void;
  setMonthlyRevenue: (data: RevenueData[]) => void;
  setTopProducts: (data: TopProduct[]) => void;
  setSummaryStats: (data: SummaryStats) => void;
  setLoading: (status: boolean) => void;
  setError: (msg: string | null) => void;
  setFilters: (newFilters: Partial<StatisticsState['filters']>) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];
const getThirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};

export const useStatisticsStore = create<StatisticsState>((set) => ({
  dailyRevenue: [],
  monthlyRevenue: [],
  topProducts: [],
  summaryStats: null,
  isLoading: false,
  error: null,
  filters: {
    startDate: getThirtyDaysAgo(),
    endDate: getToday(),
    year: new Date().getFullYear(),
  },

  setDailyRevenue: (dailyRevenue) => set({ dailyRevenue }),
  setMonthlyRevenue: (monthlyRevenue) => set({ monthlyRevenue }),
  setTopProducts: (topProducts) => set({ topProducts }),
  setSummaryStats: (summaryStats) => set({ summaryStats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
}));
