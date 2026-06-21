package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Cart;
import com.shop.backend.Entity.CartItem;
import com.shop.backend.Entity.ProductVariant;
import com.shop.backend.Entity.User;
import com.shop.backend.Repository.CartItemRepository;
import com.shop.backend.Repository.CartRepository;
import com.shop.backend.Repository.ProductVariantRepository;
import com.shop.backend.Repository.UserRepository;
import com.shop.backend.Service.CartItemService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemServiceImpl implements CartItemService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public CartItem create(CartItem cartItem, Long userId) {
        // 1. Tìm User (Sử dụng trực tiếp userId được truyền từ Controller cho nhanh)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Long variantId = cartItem.getVariant().getId();
        ProductVariant managedVariant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // 2. Tìm hoặc tạo mới Giỏ hàng
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalBill(0.0);
                    return cartRepository.save(newCart);
                });

        // 3. KIỂM TRA TRÙNG LẶP: Nếu sản phẩm (variant) đã có trong giỏ, chỉ tăng số lượng
        List<CartItem> existingItems = cart.getItems();
        if (existingItems != null) {
            for (CartItem item : existingItems) {
                if (item.getVariant().getId().equals(cartItem.getVariant().getId())) {
                    // Nếu trùng sản phẩm, cộng thêm số lượng thay vì tạo dòng mới
                    item.setQuantity(item.getQuantity() + cartItem.getQuantity());
                    CartItem updatedItem = cartItemRepository.save(item);
                    updateCartTotal(cart);
                    return updatedItem;
                }
            }
        }

        // 4. Nếu là sản phẩm mới: Gán giỏ hàng và lưu
        cartItem.setVariant(managedVariant); // Dùng managedVariant thay vì cái từ Frontend gửi lên
        cartItem.setCart(cart);
        cartItem.setPrice(managedVariant.getPrice()); // Lấy giá trực tiếp từ DB cho an toàn

        CartItem savedItem = cartItemRepository.save(cartItem);
        if (cart.getItems() == null) cart.setItems(new java.util.ArrayList<>());
        cart.getItems().add(savedItem);
        updateCartTotal(cart);

        return savedItem;
    }

    private void updateCartTotal(Cart cart) {
        double total = 0.0;
        // Lấy lại dữ liệu mới nhất từ DB để tính toán chính xác
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId()); 
        
        if (items != null) {
            for (CartItem item : items) {
                double itemPrice = (item.getPrice() != null) ? item.getPrice() : 0.0;
                total += itemPrice * item.getQuantity();
            }
        }

        cart.setTotalBill(total);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public CartItem update(Long id, CartItem details) {
        CartItem existingItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CartItem"));

        existingItem.setQuantity(details.getQuantity());
        // Nếu giá sản phẩm thay đổi cũng cập nhật ở đây
        if(details.getPrice() != null) existingItem.setPrice(details.getPrice());

        CartItem updatedItem = cartItemRepository.save(existingItem);

        // Tính lại tiền sau khi sửa số lượng
        updateCartTotal(updatedItem.getCart());

        return updatedItem;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CartItem"));

        Cart cart = item.getCart();
        cartItemRepository.delete(item);

        // Sau khi xóa, danh sách items trong object cart cần được làm mới để tính lại tiền
        cart.getItems().remove(item);
        updateCartTotal(cart);
    }

    @Override
    public CartItem getById(Long id) {
        return cartItemRepository.findById(id).orElse(null);
    }

}
