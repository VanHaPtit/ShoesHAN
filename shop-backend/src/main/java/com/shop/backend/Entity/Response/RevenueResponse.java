package com.shop.backend.Entity.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueResponse {
    private String label; // "YYYY-MM-DD" hoặc "Month X"
    private Double totalRevenue;
}
