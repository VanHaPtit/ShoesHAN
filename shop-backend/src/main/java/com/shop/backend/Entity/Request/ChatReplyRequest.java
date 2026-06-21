package com.shop.backend.Entity.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatReplyRequest {
    @NotNull(message = "ID người nhận không được để trống")
    private Long targetUserId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;
}
