package com.shop.backend.Repository;

import com.shop.backend.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem ,Long> {

    @Query("SELECT p.id, p.name, SUM(oi.quantity), SUM(oi.quantity * oi.priceAtPurchase) " +
           "FROM OrderItem oi JOIN oi.variant v JOIN v.product p " +
           "WHERE oi.order.status IN :statuses AND oi.order.orderDate >= :startDate AND oi.order.orderDate <= :endDate " +
           "GROUP BY p.id, p.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(
            @Param("statuses") List<com.shop.backend.Entity.Enum.OrderStatus> statuses,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );
}
