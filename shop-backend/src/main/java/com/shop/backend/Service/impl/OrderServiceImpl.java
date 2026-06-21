package com.shop.backend.Service.impl;

import com.shop.backend.Entity.*;
import com.shop.backend.Entity.Enum.PaymentMethod;
import com.shop.backend.Entity.Enum.OrderStatus;
import com.shop.backend.Entity.Enum.PaymentStatus;
import com.shop.backend.Entity.Response.OrderItemResponse;
import com.shop.backend.Entity.Response.OrderResponse;
import com.shop.backend.Repository.OrderRepository;
import com.shop.backend.Repository.ProductVariantRepository;
import com.shop.backend.Repository.ReviewRepository;
import com.shop.backend.Repository.UserRepository;
import com.shop.backend.Repository.ProductRepository;
import com.shop.backend.SendEmail.QualifiedUserResponse;
import com.shop.backend.Service.OrderService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductVariantRepository variantRepository ;

    @Autowired
    private UserRepository userRepository ;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;



    private OrderResponse mapToOrderResponse(Order order) {
        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            ProductVariant v = item.getVariant();
            Product p = v.getProduct();
            
            boolean hasReviewed = item.isReviewed();
            if (!hasReviewed && userId != null) {
                hasReviewed = reviewRepository.existsByUserIdAndProductId(userId, p.getId());
            }

            // Tính toán canReview: 
            // 1. Phải chưa review
            // 2. Đơn hàng phải ở trạng thái DELIVERED
            // 3. Không được quá 20 ngày
            boolean canReview = false;
            if (!hasReviewed && order.getStatus() == OrderStatus.DELIVERED && order.getOrderDate() != null) {
                if (!order.getOrderDate().plusDays(20).isBefore(LocalDateTime.now())) {
                    canReview = true;
                }
            }

            return OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .productName(p.getName())
                    .image(p.getImages().isEmpty() ? null : p.getImages().get(0))
                    .size(v.getSize())
                    .color(v.getColor())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getPriceAtPurchase())
                    .isReviewed(hasReviewed)
                    .canReview(canReview)
                    .build();
        }).toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .paymentMethod(order.getPayment() != null && order.getPayment().getMethod() != null ? order.getPayment().getMethod().name() : "COD")
                .totalPrice(order.getTotalPrice())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .orderDate(order.getOrderDate() != null ? order.getOrderDate() : null)
                .items(itemResponses)
                .build();
    }


    @Override
    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    public org.springframework.data.domain.Page<OrderResponse> getAllPage(org.springframework.data.domain.Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }

    @Override
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + id));
    }

    @Override
    public OrderResponse getOrderResponseById(Long id) {
        Order order = getById(id);
        return mapToOrderResponse(order);
    }



    @Override
    @Transactional
    @Retryable(
            value = { ObjectOptimisticLockingFailureException.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 100)
    )
    public Order create(Order order) {
        // 1. Lấy và kiểm tra User
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng!"));

        // 2. Kiểm tra danh sách sản phẩm
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng phải có ít nhất một sản phẩm!");
        }

        order.setUser(currentUser);

        // 3. Tạo mã đơn hàng duy nhất
        if (order.getOrderNumber() == null) {
            order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        double total = 0;

        // 4. Kiểm tra tồn kho và trừ số lượng
        for (OrderItem item : order.getItems()) {
            // 1. Lấy variant "xịn" từ DB (đối tượng này có chứa số version hiện tại)
            ProductVariant variant = variantRepository.findById(item.getVariant().getId())
                    .orElseThrow(() -> new RuntimeException("Biến thể sản phẩm không tồn tại!"));

            if (variant.getStock() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + variant.getProduct().getName() + " đã hết hàng!");
            }

            // 2. Trừ kho
            variant.setStock(variant.getStock() - item.getQuantity());
            variantRepository.save(variant);

            // 3. QUAN TRỌNG NHẤT: Gán lại variant đã tìm thấy vào item
            // Điều này thay thế cái variant "null version" từ JSON bằng variant "managed" từ DB
            item.setVariant(variant);

            item.setPriceAtPurchase(variant.getPrice());
            item.setOrder(order);
            total += item.getPriceAtPurchase() * item.getQuantity();
        }

        order.setTotalPrice(total);
        order.setStatus(OrderStatus.PENDING);

        // 5. Khởi tạo thông tin Thanh toán (Payment)
        Payment payment = order.getPayment();
        if (payment == null) {
            payment = new Payment();
            if (order.getPaymentMethod() != null) {
                payment.setMethod(PaymentMethod.valueOf(order.getPaymentMethod()));
            } else {
                payment.setMethod(PaymentMethod.COD); // Mặc định là COD nếu FE không chỉ định
            }
        }
        payment.setOrder(order);
        payment.setStatus(PaymentStatus.PENDING);
        order.setPayment(payment);

        return orderRepository.save(order);
    }

    @Recover
    public Order recover(ObjectOptimisticLockingFailureException e, Order order) {
        throw new RuntimeException("Hệ thống đang bận do có quá nhiều người cùng mua sản phẩm này. Bạn vui lòng thử lại sau vài giây!");
    }

    @Override
    @Transactional
    public Order update(Long id, Order orderDetails) {
        Order existingOrder = getById(id);

        OrderStatus oldStatus = existingOrder.getStatus();
        OrderStatus newStatus = orderDetails.getStatus();

        if (oldStatus != newStatus) {
            // Khi đơn hàng chuyển sang DELIVERED -> Tăng tổng số lượng đã bán (SALES)
            if (newStatus == OrderStatus.DELIVERED) {
                for (OrderItem item : existingOrder.getItems()) {
                    Product product = item.getVariant().getProduct();
                    if (product.getTotalSold() == null) product.setTotalSold(0);
                    product.setTotalSold(product.getTotalSold() + item.getQuantity());
                    productRepository.save(product);
                }
            } 
            // Khi đơn hàng bị huỷ (CANCELLED) -> Hoàn lại số lượng tồn kho (INVENTORY)
            else if (newStatus == OrderStatus.CANCELLED) {
                for (OrderItem item : existingOrder.getItems()) {
                    ProductVariant variant = item.getVariant();
                    variant.setStock(variant.getStock() + item.getQuantity());
                    variantRepository.save(variant);

                    // Nếu đơn trước đó đã giao (DELIVERED) mà giờ bị huỷ, cần trừ lại doanh số
                    if (oldStatus == OrderStatus.DELIVERED) {
                        Product product = variant.getProduct();
                        if (product.getTotalSold() != null && product.getTotalSold() >= item.getQuantity()) {
                            product.setTotalSold(product.getTotalSold() - item.getQuantity());
                            productRepository.save(product);
                        }
                    }
                }
            }
        }

        existingOrder.setStatus(newStatus);
        existingOrder.setReceiverName(orderDetails.getReceiverName());
        existingOrder.setReceiverPhone(orderDetails.getReceiverPhone());
        existingOrder.setShippingAddress(orderDetails.getShippingAddress());
        return orderRepository.save(existingOrder);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Đơn hàng không tồn tại!");
        }
        orderRepository.deleteById(id);
    }

    @Override
    public List<QualifiedUserResponse> getQualifiedUsersForEmail(int minPaidCount) {
        // Truyền thẳng Enum OrderStatus.PAID vào
        List<Object[]> results = orderRepository.findUsersWithOrderCountGreaterThan(minPaidCount, OrderStatus.PAID);

        // Map kết quả: row[0] là userId, row[1] là email, row[2] là count
        return results.stream()
                .map(row -> new QualifiedUserResponse(
                        (Long) row[0],
                        (String) row[1], // Lấy email
                        ((Number) row[2]).intValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }
}
