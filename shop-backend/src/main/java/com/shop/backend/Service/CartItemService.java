package com.shop.backend.Service;

import com.shop.backend.Entity.CartItem;

import java.util.List;

public interface CartItemService {
    CartItem create(CartItem cartItem, Long userId);
    CartItem update(Long id, CartItem details);
    public void delete(Long id);
    CartItem getById(Long id);
}
