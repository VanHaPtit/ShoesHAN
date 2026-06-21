package com.shop.backend.SendEmail.ForgotPassword;

import com.shop.backend.Repository.UserRepository;
import com.shop.backend.SendEmail.EmailRequest;
import com.shop.backend.SendEmail.SendGridMailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ForgotPasswordService {

    @Autowired
    private UserRepository userRepository; // Repo của bạn

    @Autowired
    private SendGridMailService sendGridMailService;

    @Autowired
    private PasswordEncoder passwordEncoder; // Để mã hóa trước khi lưu DB

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public void processForgotPassword(String email) {
        String cleanEmail = email != null ? email.trim() : "";
        // 1. Kiểm tra user có tồn tại không
        var user = userRepository.findByEmail(cleanEmail)
                .orElseGet(() -> userRepository.findByUsername(cleanEmail)
                .orElseThrow(() -> new RuntimeException("Email/Username không tồn tại trong hệ thống: " + cleanEmail)));

        // 2. Tạo mật khẩu mới
        String newPassword = PasswordGenerator.generateRandomPassword(8);

        // 3. Cập nhật vào DB sử dụng JdbcTemplate để qua mặt hoàn toàn Hibernate Validation
        jdbcTemplate.update("UPDATE users SET password = ? WHERE id = ?", passwordEncoder.encode(newPassword), user.getId());

        System.out.println("==================================================");
        System.out.println("Mật khẩu mới của user " + cleanEmail + " là: " + newPassword);
        System.out.println("==================================================");

        // 4. Gửi mail thông báo
        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setToEmail(email);
        emailRequest.setSubject("Khôi phục mật khẩu - Shop Backend");
        emailRequest.setContent("Chào bạn,\n\nMật khẩu mới của bạn là: " + newPassword +
                "\nVui lòng đăng nhập và đổi lại mật khẩu ngay để bảo mật.");

        try {
            sendGridMailService.sendMail(emailRequest);
        } catch (Exception e) {
            System.err.println("Không thể gửi email: " + e.getMessage());
        }
    }
}
