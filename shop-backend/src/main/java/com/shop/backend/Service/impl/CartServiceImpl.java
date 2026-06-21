package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Cart;
import com.shop.backend.Repository.CartRepository;
import com.shop.backend.Service.CartService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Override
    public List<Cart> getAll() {
        return cartRepository.findAll();
    }

    @Override
    public Cart getById(Long id) {
        return cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng ID: " + id));
    }

    @Override
    public Cart getByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng chưa có giỏ hàng!"));
    }

    @Override
    @Transactional
    public Cart create(Cart cart) {
        // Kiểm tra nếu User đã có giỏ hàng thì không tạo thêm (Logic One-to-One)
        if (cart.getUser() != null && cartRepository.findByUserId(cart.getUser().getId()).isPresent()) {
            throw new RuntimeException("Người dùng này đã có giỏ hàng rồi!");
        }

        // Gán ngược cart vào các item nếu có
        if (cart.getItems() != null) {
            cart.getItems().forEach(item -> item.setCart(cart));
        }
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart update(Long id, Cart cartDetails) {
        Cart existingCart = getById(id);

        // Thường update giỏ hàng là cập nhật tổng tiền hoặc danh sách item
        existingCart.setTotalBill(cartDetails.getTotalBill());

        // Lưu ý: Việc thêm/xóa item trong giỏ hàng thường nên tách ra API riêng
        // để xử lý tính toán logic cho chính xác.

        return cartRepository.save(existingCart);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Cart cart = getById(id);
        cartRepository.delete(cart);
    }
}
