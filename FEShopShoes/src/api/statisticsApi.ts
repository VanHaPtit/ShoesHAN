import axiosClient from './axiosClient';

export interface RevenueData {
  label: string;
  totalRevenue: number;
}

export interface TopProduct {
  name: string;
  image: string;
  totalSold: number;
  totalRevenue: number;
}

export const statisticsApi = {
  getDailyRevenue: (startDate: string, endDate: string) => {
    return axiosClient.get<RevenueData[]>('/statistics/daily-revenue', {
      params: { startDate, endDate }
    });
  },

  getMonthlyRevenue: (year: number) => {
    return axiosClient.get<RevenueData[]>('/statistics/monthly-revenue', {
      params: { year }
    });
  },

  getTopProducts: (startDate: string, endDate: string, limit: number = 5) => {
    return axiosClient.get<TopProduct[]>('/statistics/top-products', {
      params: { startDate, endDate, limit }
    });
  },

  getSummaryStats: (startDate: string, endDate: string) => {
    return axiosClient.get<import('../store/statisticsStore').SummaryStats>('/statistics/summary', {
      params: { startDate, endDate }
    });
  }
};
