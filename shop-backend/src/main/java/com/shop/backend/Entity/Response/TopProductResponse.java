package com.shop.backend.Entity.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String image;
    private Long totalQuantitySold;
    private Double totalRevenue;
}
