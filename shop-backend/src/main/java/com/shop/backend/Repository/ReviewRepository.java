package com.shop.backend.Repository;

import com.shop.backend.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Lấy danh sách đánh giá của một sản phẩm
    List<Review> findByProductId(Long productId);

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
