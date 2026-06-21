package com.shop.backend.Controller;

import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Response.OrderResponse;
import com.shop.backend.SendEmail.EmailConditionRequest;
import com.shop.backend.SendEmail.QualifiedUserResponse;
import com.shop.backend.Service.OrderService;
import com.shop.backend.Service.impl.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAll());
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getAllOrdersPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(orderService.getAllPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderResponseById(id));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
        return new ResponseEntity<>(orderService.create(order), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        return ResponseEntity.ok(orderService.update(id, orderDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok("Đã xóa đơn hàng!");
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        // 1. Lấy thông tin User đang đăng nhập từ Token
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // 2. Gọi Service lấy đơn hàng của chính User đó
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @Autowired
    private com.shop.backend.Service.UserService userService;

    @PostMapping("/check-condition")
    public ResponseEntity<List<QualifiedUserResponse>> checkCondition(@RequestBody EmailConditionRequest request) {
        List<QualifiedUserResponse> result = userService.getQualifiedUsersForEmail(request);
        return ResponseEntity.ok(result);
    }


}
