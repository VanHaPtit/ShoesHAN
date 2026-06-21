package com.shop.backend.Service;

import com.shop.backend.Entity.Response.RevenueResponse;
import com.shop.backend.Entity.Response.TopProductResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface StatisticsService {
    List<RevenueResponse> getDailyRevenue(LocalDateTime startDate, LocalDateTime endDate);
    List<RevenueResponse> getMonthlyRevenue(int year);
    List<TopProductResponse> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate, int limit);
    com.shop.backend.Entity.Response.SummaryStatsResponse getSummaryStats(LocalDateTime startDate, LocalDateTime endDate);
}
