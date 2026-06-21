package com.shop.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.backend.Entity.Response.ReviewResponse;
import com.shop.backend.Entity.Response.ProductReviewResponse;
import com.shop.backend.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@CrossOrigin("*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ObjectMapper objectMapper;

    // API: Gửi đánh giá mới
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> createReview(
            @RequestPart("review") String reviewJson, // Nhận JSON dạng String
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            objectMapper.findAndRegisterModules();
            ReviewResponse reviewRequest = objectMapper.readValue(reviewJson, ReviewResponse.class);

            return ResponseEntity.ok(reviewService.create(reviewRequest, files));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xử lý đánh giá: " + e.getMessage());
        }
    }

    // API: Lấy toàn bộ đánh giá của 1 sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<ProductReviewResponse> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }
}
