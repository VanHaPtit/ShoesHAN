package com.shop.backend.Entity.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryStatsResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long newCustomers;
    private Long totalStock;
}
