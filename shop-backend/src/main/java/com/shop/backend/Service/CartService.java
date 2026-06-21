package com.shop.backend.Service;

import com.shop.backend.Entity.Cart;

import java.util.List;

public interface CartService {
    List<Cart> getAll();
    Cart getById(Long id);
    Cart getByUserId(Long userId);
    Cart create(Cart cart);
    Cart update(Long id, Cart cartDetails);
    public void delete(Long id);
}
