package com.shop.backend.SendEmail;

import lombok.Data;

@Data
public class EmailRequest {
    private String toEmail;
    private String subject;
    private String content;
}
