package com.shop.backend.payment;

import com.shop.backend.Entity.Enum.OrderStatus;
import com.shop.backend.Entity.Enum.PaymentMethod;
import com.shop.backend.Entity.Enum.PaymentStatus;
import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Payment;
import com.shop.backend.Repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("${spring.application.api-prefix}/payment")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentController {
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final VNPAYConfig vnPayConfig;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/vn-pay")
    public ResponseObject<PaymentDTO.VNPayResponse> pay(HttpServletRequest request, @RequestParam String orderNumber) {
        return new ResponseObject<>(HttpStatus.OK, "Success", paymentService.createVnPayPayment(request, orderNumber));
    }

    @GetMapping("/vn-pay-callback")
    @Transactional
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String domain = request.getParameter("domain");
        String targetFrontendUrl = (domain != null && !domain.isEmpty()) ? domain : this.frontendUrl;

        Map<String, String> vnpParams = VNPayUtil.extractVnPayResponseParams(request);
        String providedHash = vnpParams.get("vnp_SecureHash");
        String calculatedHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), VNPayUtil.buildHashData(vnpParams));

        if (providedHash == null || !providedHash.equalsIgnoreCase(calculatedHash)) {
            response.sendRedirect(targetFrontendUrl + "/#/?payment=failed&reason=invalid-signature");
            return;
        }

        String status = request.getParameter("vnp_ResponseCode");
        String orderNumber = request.getParameter("vnp_TxnRef");

        try {
            if ("00".equals(status)) {
                Order order = orderRepository.findByOrderNumber(orderNumber);

                if (order != null) {
                    order.setStatus(OrderStatus.PAID);

                    Payment payment = order.getPayment();
                    if (payment == null) {
                        payment = new Payment();
                        payment.setOrder(order);
                    }
                    payment.setMethod(PaymentMethod.VNPAY);
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setTransactionId(request.getParameter("vnp_TransactionNo"));

                    order.setPayment(payment);
                    orderRepository.save(order);

                    response.sendRedirect(targetFrontendUrl + "/#/?payment=success&order=" + orderNumber);
                    return;
                }
            }

            response.sendRedirect(targetFrontendUrl + "/#/?payment=failed");
        } catch (Exception e) {
            response.sendRedirect(targetFrontendUrl + "/#/?payment=error");
        }
    }
}
