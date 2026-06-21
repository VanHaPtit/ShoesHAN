package com.shop.backend.Entity.Response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String status;
    private String paymentMethod;
    private Double totalPrice;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime orderDate;
    private List<OrderItemResponse> items;
}
