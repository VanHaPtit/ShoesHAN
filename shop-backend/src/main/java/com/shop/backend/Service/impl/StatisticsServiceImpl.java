package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Enum.OrderStatus;
import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Product;
import com.shop.backend.Entity.Response.RevenueResponse;
import com.shop.backend.Entity.Response.TopProductResponse;
import com.shop.backend.Repository.OrderItemRepository;
import com.shop.backend.Repository.OrderRepository;
import com.shop.backend.Repository.ProductRepository;
import com.shop.backend.Service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    private final List<OrderStatus> VALID_STATUSES = Arrays.asList(OrderStatus.PAID, OrderStatus.DELIVERED);

    @Override
    public List<RevenueResponse> getDailyRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findOrdersByStatusAndDateRange(VALID_STATUSES, startDate, endDate);
        
        Map<LocalDate, Double> dailyRevenue = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().toLocalDate(),
                        Collectors.summingDouble(Order::getTotalPrice)
                ));

        List<RevenueResponse> response = new ArrayList<>();
        // Trả về tất cả các ngày trong khoảng, kể cả ngày doanh thu = 0
        LocalDate current = startDate.toLocalDate();
        LocalDate end = endDate.toLocalDate();
        while (!current.isAfter(end)) {
            response.add(new RevenueResponse(
                    current.toString(),
                    dailyRevenue.getOrDefault(current, 0.0)
            ));
            current = current.plusDays(1);
        }

        return response;
    }

    @Override
    public List<RevenueResponse> getMonthlyRevenue(int year) {
        LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        
        List<Order> orders = orderRepository.findOrdersByStatusAndDateRange(VALID_STATUSES, startDate, endDate);

        Map<Month, Double> monthlyRevenue = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().getMonth(),
                        Collectors.summingDouble(Order::getTotalPrice)
                ));

        List<RevenueResponse> response = new ArrayList<>();
        for (Month month : Month.values()) {
            response.add(new RevenueResponse(
                    "Tháng " + month.getValue(),
                    monthlyRevenue.getOrDefault(month, 0.0)
            ));
        }

        return response;
    }

    @Override
    public List<TopProductResponse> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<Object[]> results = orderItemRepository.findTopSellingProducts(VALID_STATUSES, startDate, endDate);
        
        return results.stream()
                .limit(limit)
                .map(row -> {
                    Long productId = (Long) row[0];
                    String productName = (String) row[1];
                    Long quantity = ((Number) row[2]).longValue();
                    Double revenue = ((Number) row[3]).doubleValue();
                    
                    // Lấy ảnh gốc (có thể làm chậm nếu DB quá to, nhưng với phân trang/limit nhỏ thì okay)
                    Product product = productRepository.findById(productId).orElse(null);
                    String image = (product != null && product.getImages() != null && !product.getImages().isEmpty()) 
                            ? product.getImages().get(0) : null;

                    return new TopProductResponse(productId, productName, image, quantity, revenue);
                })
                .collect(Collectors.toList());
    }

    @Autowired
    private com.shop.backend.Repository.UserRepository userRepository;

    @Autowired
    private com.shop.backend.Repository.ProductVariantRepository productVariantRepository;

    @Override
    public com.shop.backend.Entity.Response.SummaryStatsResponse getSummaryStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findOrdersByStatusAndDateRange(VALID_STATUSES, startDate, endDate);
        
        Double totalRevenue = orders.stream().mapToDouble(Order::getTotalPrice).sum();
        Long totalOrders = (long) orders.size();
        
        Long newCustomers = userRepository.countByCreatedAtBetween(startDate, endDate);
        Long totalStock = productVariantRepository.sumTotalStock();
        
        return new com.shop.backend.Entity.Response.SummaryStatsResponse(totalRevenue, totalOrders, newCustomers, totalStock);
    }
}
