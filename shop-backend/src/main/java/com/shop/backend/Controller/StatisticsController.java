package com.shop.backend.Controller;

import com.shop.backend.Entity.Response.RevenueResponse;
import com.shop.backend.Entity.Response.TopProductResponse;
import com.shop.backend.Service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
@CrossOrigin("*")
// @PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    // Format: yyyy-MM-dd
    @GetMapping("/daily-revenue")
    public ResponseEntity<List<RevenueResponse>> getDailyRevenue(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        LocalDateTime startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateStr, DateTimeFormatter.ISO_DATE).atTime(LocalTime.MAX);
        
        return ResponseEntity.ok(statisticsService.getDailyRevenue(startDate, endDate));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<List<RevenueResponse>> getMonthlyRevenue(@RequestParam("year") int year) {
        return ResponseEntity.ok(statisticsService.getMonthlyRevenue(year));
    }

    // Format: yyyy-MM-dd
    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        
        LocalDateTime startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateStr, DateTimeFormatter.ISO_DATE).atTime(LocalTime.MAX);

        return ResponseEntity.ok(statisticsService.getTopSellingProducts(startDate, endDate, limit));
    }

    @GetMapping("/summary")
    public ResponseEntity<com.shop.backend.Entity.Response.SummaryStatsResponse> getSummaryStats(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        LocalDateTime startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(endDateStr, DateTimeFormatter.ISO_DATE).atTime(LocalTime.MAX);
        
        return ResponseEntity.ok(statisticsService.getSummaryStats(startDate, endDate));
    }
}
