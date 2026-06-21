package com.shop.backend.Service;

import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Response.OrderResponse;
import com.shop.backend.SendEmail.QualifiedUserResponse;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    List<OrderResponse> getAll();
    Page<OrderResponse> getAllPage(Pageable pageable);
    List<OrderResponse> getOrdersByUserId(Long userId);
    public Order getById(Long id);
    OrderResponse getOrderResponseById(Long id);
    public Order create(Order order);
    public Order update(Long id, Order orderDetails);
    public void delete(Long id);
    List<QualifiedUserResponse> getQualifiedUsersForEmail(int minPaidCount);
}
