package com.shop.backend.Repository;

import com.shop.backend.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // Tìm giỏ hàng theo ID người dùng
    Optional<Cart> findByUserId(Long userId);
}
