package com.shop.backend.SendEmail;

import com.shop.backend.Entity.Response.OrderResponse;
import com.shop.backend.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/mail")
public class SendGridEmailController {

    @Autowired
    private SendGridMailService sendGridMailService;

    @Autowired
    private OrderService orderService ;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        try {
            sendGridMailService.sendMail(emailRequest);
            return ResponseEntity.ok("Email đã được gửi thành công đến " + emailRequest.getToEmail());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Gửi email thất bại: " + e.getMessage());
        }
    }
}
