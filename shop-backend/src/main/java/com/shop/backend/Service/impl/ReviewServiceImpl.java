package com.shop.backend.Service.impl;

import com.shop.backend.Entity.*;
import com.shop.backend.Entity.Response.OrderResponse;
import com.shop.backend.Entity.Response.ReviewResponse;
import com.shop.backend.Entity.Response.ProductReviewResponse;
import com.shop.backend.Repository.*;
import com.shop.backend.Service.CloudinaryService;
import com.shop.backend.Service.ReviewService;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private OrderRepository orderRepository ;
    @Autowired
    private CloudinaryService cloudinaryService ;
    @Override
    public ReviewResponse create(ReviewResponse reviewResponse, List<MultipartFile> files) throws Exception {
        // 1. Tìm User và Product
        User user = userRepository.findById(reviewResponse.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Product product = productRepository.findById(reviewResponse.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // 2. Tìm chính xác OrderItem mà người dùng đang muốn đánh giá
        OrderItem item = orderItemRepository.findById(reviewResponse.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng"));

        // 3. Kiểm tra tính hợp lệ của OrderItem này
        // Kiểm tra xem món hàng này có thuộc về User này không (Bảo mật)
        if (!item.getOrder().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền đánh giá sản phẩm của đơn hàng này");
        }

        // Kiểm tra xem đơn hàng đã đánh giá chưa
        if (item.isReviewed()) {
            throw new RuntimeException("Sản phẩm này trong đơn hàng của bạn đã được đánh giá rồi");
        }

        // Người dùng chỉ được phép đánh giá số * đúng 1 lần duy nhất cho cùng 1 sản phẩm
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này trước đó rồi. Mỗi người dùng chỉ được đánh giá 1 lần duy nhất cho cùng một sản phẩm.");
        }

        // Kiểm tra xem đơn hàng đã được thanh toán/thành công chưa
        if (item.getOrder().getStatus() == com.shop.backend.Entity.Enum.OrderStatus.PENDING || 
            item.getOrder().getStatus() == com.shop.backend.Entity.Enum.OrderStatus.CANCELLED) {
            throw new RuntimeException("Chỉ được đánh giá khi đơn hàng đã thanh toán thành công");
        }

        // Kiểm tra thời hạn 20 ngày
        LocalDateTime orderDate = item.getOrder().getOrderDate();
        if (orderDate.plusDays(20).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Đã quá thời hạn 20 ngày kể từ khi đặt hàng, không thể đánh giá");
        }

        // 2. Xử lý Upload ảnh lên Cloudinary
        List<String> imageUrls = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String url = cloudinaryService.uploadImage(file);
                    imageUrls.add(url);
                }
            }
        }

        // 3. Chuyển từ DTO sang Entity
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(reviewResponse.getRating());
        review.setComment(reviewResponse.getComment());

        review.setImages(imageUrls);
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        item.setReviewed(true);
        orderItemRepository.save(item);

        return mapToReviewResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewResponse getReviewsByProduct(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        List<ReviewResponse> responses = new ArrayList<>();
        
        double sumRating = 0;

        for (Review review : reviews) {
            Hibernate.initialize(review.getImages());
            responses.add(mapToReviewResponse(review));
            sumRating += review.getRating();
        }

        double averageRating = 5.0;
        if (!reviews.isEmpty()) {
            averageRating = Math.round((sumRating / reviews.size()) * 10.0) / 10.0;
        }

        return ProductReviewResponse.builder()
                .reviews(responses)
                .averageRating(averageRating)
                .totalReviews(responses.size())
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .productId(review.getProduct().getId())
                .images(review.getImages()) // PHẢI THÊM DÒNG NÀY
                .createdAt(review.getCreatedAt())
                .build();
    }
}