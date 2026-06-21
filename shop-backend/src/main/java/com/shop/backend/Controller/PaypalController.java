package com.shop.backend.Controller;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;

import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import com.shop.backend.Entity.Enum.OrderStatus;
import com.shop.backend.Entity.Enum.PaymentStatus;
import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Request.PaypalRequest;
import com.shop.backend.Repository.OrderRepository;
import com.shop.backend.Service.OrderService;
import com.shop.backend.Service.PaypalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/paypal")
@CrossOrigin("*")
public class PaypalController {

    @Autowired
    private PaypalService paypalService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN method VARCHAR(50);");
            System.out.println("ALTER TABLE payments MODIFY COLUMN method VARCHAR(50) executed successfully");
        } catch (Exception e) {
            System.err.println("Could not alter payments table: " + e.getMessage());
        }
    }

    @Autowired
    private OrderRepository orderRepository ;

    @Autowired
    private OrderService orderService ;

    @Value("${paypal.url.success}")
    private String successUrl;

    @Value("${paypal.url.cancel}")
    private String cancelUrl;

    @PostMapping()
    public ResponseEntity<String> createPayment(@RequestBody Order orderRequest, jakarta.servlet.http.HttpServletRequest request, @RequestParam(required=false) String domain) {
        try {
            // BƯỚC 1: Gọi OrderService để lưu đơn hàng vào DB
            // Hệ thống sẽ thực hiện: Gán User, Trừ kho (Optimistic Locking),
            // và quan trọng nhất là tính toán lại totalPrice chuẩn xác từ Database (VND).
            Order savedOrder = orderService.create(orderRequest);

            // BƯỚC 2: Gọi PayPal Service
            // Lưu ý các thay đổi:
            // 1. Loại bỏ tham số "USD" (Service mới đã tự định nghĩa USD).
            // 2. Truyền savedOrder.getTotalPrice() - lúc này là giá trị VNĐ chuẩn từ DB.
            String baseUrl = request.getRequestURL().toString();
            String dynamicSuccessUrl = baseUrl + "/success";
            String dynamicCancelUrl = baseUrl + "/cancel";
            if (domain != null && !domain.isEmpty()) {
                try {
                    String encodedDomain = java.net.URLEncoder.encode(domain, "UTF-8");
                    dynamicSuccessUrl += "?domain=" + encodedDomain;
                    dynamicCancelUrl += "?domain=" + encodedDomain;
                } catch (Exception e) {}
            }

            String approvalUrl = paypalService.createPayment(
                    savedOrder.getTotalPrice(),
                    "Thanh toán đơn hàng: " + savedOrder.getOrderNumber(),
                    dynamicCancelUrl,
                    dynamicSuccessUrl,
                    savedOrder.getOrderNumber()
            );

            // Trả về Approval URL để Frontend thực hiện redirect
            return ResponseEntity.ok(approvalUrl);

        } catch (PayPalRESTException e) {
            // Lỗi từ phía cổng thanh toán PayPal (ví dụ: lỗi kết nối, sai cấu hình API)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống PayPal: " + e.getMessage());
        } catch (RuntimeException e) {
            // Lỗi nghiệp vụ từ OrderService: Hết hàng, hoặc có người khác đã mua trước
            // (xử lý lỗi tranh chấp phiên bản @Version)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Không thể tạo đơn hàng: " + e.getMessage());
        }
    }

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/success")
    @Transactional
    public void success(@RequestParam("paymentId") String paymentId,
                        @RequestParam("PayerID") String payerId,
                        @RequestParam(value = "orderNumber", required = false) String orderNumber,
                        @RequestParam(value = "domain", required = false) String domain,
                        jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        String targetFrontendUrl = (domain != null && !domain.isEmpty()) ? domain : this.frontendUrl;
        try {
            // BƯỚC 3: Thực thi thanh toán (PayPal bắt đầu trừ tiền khách)
            com.paypal.api.payments.Payment paypalPayment = paypalService.executePayment(paymentId, payerId);

            if (paypalPayment.getState().equals("approved")) {
                // BƯỚC 4: Tìm đơn và cập nhật trạng thái PAID
                Order order = orderRepository.findByOrderNumber(orderNumber);
                if (order != null) {
                    order.setStatus(OrderStatus.PAID);

                    // Cập nhật thông tin thanh toán (Transaction ID)
                    if (order.getPayment() != null) {
                        order.getPayment().setMethod(PaymentStatus.SUCCESS == PaymentStatus.SUCCESS ? com.shop.backend.Entity.Enum.PaymentMethod.PAYPAL : com.shop.backend.Entity.Enum.PaymentMethod.PAYPAL);
                        order.getPayment().setStatus(PaymentStatus.SUCCESS);
                        order.getPayment().setTransactionId(paymentId);
                    }
                    orderRepository.save(order);
                }
                response.sendRedirect(targetFrontendUrl + "/#/?payment=success&order=" + orderNumber);
                return;
            }
            response.sendRedirect(targetFrontendUrl + "/#/?payment=failed");
        } catch (PayPalRESTException e) {
            response.sendRedirect(targetFrontendUrl + "/#/?payment=error");
        }
    }
}