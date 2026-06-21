package com.shop.backend.Entity.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductReviewResponse {
    private List<ReviewResponse> reviews;
    private Double averageRating;
    private Integer totalReviews;
}
