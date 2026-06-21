package com.shop.backend.Repository;

import com.shop.backend.Entity.Enum.OrderStatus;
import com.shop.backend.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Tìm đơn hàng theo mã đơn hàng
    Order findByOrderNumber(String orderNumber);
    // Tìm danh sách đơn hàng của một User
    List<Order> findByUserId(Long userId);

    // An toàn hơn: kiểm tra theo mã + userId
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    // Lấy đơn hàng mới nhất trước (DESC)
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @Query("SELECT o.user.id, o.user.email, COUNT(o.id) FROM Order o WHERE o.status = :status GROUP BY o.user.id, o.user.email HAVING COUNT(o.id) > :minPaidCount")
    List<Object[]> findUsersWithOrderCountGreaterThan(
            @Param("minPaidCount") int minPaidCount,
            @Param("status") OrderStatus status
    );

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "WHERE o.status IN :statuses " +
            "AND o.orderDate BETWEEN :start AND :end")
    List<Order> findOrdersByStatusAndDateRange(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

}
