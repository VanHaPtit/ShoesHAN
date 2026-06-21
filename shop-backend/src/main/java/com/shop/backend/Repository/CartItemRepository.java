package com.shop.backend.Repository;

import com.shop.backend.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Tìm các item thuộc một giỏ hàng cụ thể
    List<CartItem> findByCartId(Long cartId);
}
