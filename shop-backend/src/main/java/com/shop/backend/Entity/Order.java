package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.shop.backend.Entity.Enum.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String orderNumber;

    @ManyToOne @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles", "enabled", "createdAt", "imageAvt", "username", "phone"})
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> items;

    @Min(value = 0, message = "Tổng tiền không được nhỏ hơn 0")
    private Double totalPrice;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private OrderStatus status;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Payment payment;

    @Transient
    @JsonProperty
    private String paymentMethod;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Số điện thoại người nhận không hợp lệ")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @Column(updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime orderDate;

    @PrePersist
    protected void onCreate() {
        this.orderDate = LocalDateTime.now();
    }


    public Order(Long id, String orderNumber, User user, List<OrderItem> items, Double totalPrice, OrderStatus status, Payment payment, String receiverName, String receiverPhone, String shippingAddress, LocalDateTime orderDate) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.user = user;
        this.items = items;
        this.totalPrice = totalPrice;
        this.status = status;
        this.payment = payment;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.shippingAddress = shippingAddress;
        this.orderDate = orderDate;
    }

    public Order(Long id, String orderNumber, User user, List<OrderItem> items, Double totalPrice, OrderStatus status, Payment payment, String receiverName, String receiverPhone, String shippingAddress) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.user = user;
        this.items = items;
        this.totalPrice = totalPrice;
        this.status = status;
        this.payment = payment;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.shippingAddress = shippingAddress;
    }

    public Order() {
    }
}