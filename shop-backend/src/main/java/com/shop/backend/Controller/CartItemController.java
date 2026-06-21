package com.shop.backend.Controller;

import com.shop.backend.Entity.CartItem;
import com.shop.backend.Service.CartItemService;
import com.shop.backend.Service.impl.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart-items")
@CrossOrigin("*")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;



    @PostMapping
    public ResponseEntity<?> add(@Valid @RequestBody CartItem cartItem, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        // 2. Truyền thêm userId xuống Service để xử lý
        try {
            CartItem createdItem = cartItemService.create(cartItem, userId);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            // Trả về lỗi chi tiết để Frontend biết chuyện gì đang xảy ra
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> update(@PathVariable Long id, @RequestBody CartItem details) {
        return ResponseEntity.ok(cartItemService.update(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        cartItemService.delete(id);
        return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ hàng");
    }
}
