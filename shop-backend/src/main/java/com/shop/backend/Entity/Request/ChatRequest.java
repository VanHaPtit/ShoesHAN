package com.shop.backend.Entity.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;
}
