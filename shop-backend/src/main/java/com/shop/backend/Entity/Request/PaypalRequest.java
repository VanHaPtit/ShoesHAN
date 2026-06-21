package com.shop.backend.Entity.Request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class PaypalRequest {
    @NotBlank(message = "Tổng tiền không được để trống")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$", message = "Tổng tiền không hợp lệ")
    private String total;

    @NotBlank(message = "Loại tiền tệ không được để trống")
    private String currency = "USD";
}
