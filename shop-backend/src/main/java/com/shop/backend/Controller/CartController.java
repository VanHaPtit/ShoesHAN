package com.shop.backend.Controller;

import com.shop.backend.Entity.Cart;
import com.shop.backend.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carts")
@CrossOrigin("*")
public class CartController {

    @Autowired
    private CartService cartService;

    // Lấy giỏ hàng theo User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Cart> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cart> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cartService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Cart> createCart(@RequestBody Cart cart) {
        return new ResponseEntity<>(cartService.create(cart), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCart(@PathVariable Long id) {
        cartService.delete(id);
        return ResponseEntity.ok("Đã xóa giỏ hàng thành công!");
    }
}