package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.shop.backend.Entity.Enum.PaymentMethod;
import com.shop.backend.Entity.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    private String transactionId; // Từ Stripe/VNPay
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod method;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Trạng thái thanh toán không được để trống")
    private PaymentStatus status;

    public Payment(Long id, Order order, String transactionId, PaymentMethod method, PaymentStatus status) {
        this.id = id;
        this.order = order;
        this.transactionId = transactionId;
        this.method = method;
        this.status = status;
    }

    public Payment() {
    }
}
