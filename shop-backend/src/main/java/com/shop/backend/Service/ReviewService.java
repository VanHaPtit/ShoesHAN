package com.shop.backend.Service;

import com.shop.backend.Entity.Response.ReviewResponse;
import com.shop.backend.Entity.Response.ProductReviewResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReviewService {
    ReviewResponse create(ReviewResponse reviewResponse , List<MultipartFile> files) throws Exception;
    ProductReviewResponse getReviewsByProduct(Long productId);
}
