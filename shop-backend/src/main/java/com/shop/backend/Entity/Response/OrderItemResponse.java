package com.shop.backend.Entity.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String image;
    private Integer size;
    private String color;
    private Integer quantity;
    private Double priceAtPurchase;
    private Boolean isReviewed;
    private Boolean canReview;
}
