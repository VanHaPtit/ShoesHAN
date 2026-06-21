package com.shop.backend.SendEmail;

import com.shop.backend.Entity.User;
import com.shop.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class BirthdayEmailScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SendGridMailService sendGridMailService;

    // Chạy vào 8h sáng ngày mùng 1 hàng tháng: "0 0 8 1 * ?"
    @Scheduled(cron = "0 0 8 1 * ?")
    public void sendBirthdayEmails() {
        int currentMonth = LocalDate.now().getMonthValue();
        
        List<User> usersWithBirthday = userRepository.findByBirthMonth(currentMonth);

        for (User user : usersWithBirthday) {
            if (user.getEmail() != null && user.getEnabled()) {
                EmailRequest request = new EmailRequest();
                request.setToEmail(user.getEmail());
                request.setSubject("🎉 Chúc Mừng Sinh Nhật Từ FEShopShoes! 🎂");
                request.setContent("Chào " + (user.getFullName() != null ? user.getFullName() : user.getUsername()) + ",\n\n" +
                        "Tháng này là tháng sinh nhật của bạn! FEShopShoes chúc bạn một tháng sinh nhật vui vẻ, hạnh phúc và tràn đầy ý nghĩa.\n" +
                        "Cảm ơn bạn đã luôn đồng hành và ủng hộ chúng tôi.\n\n" +
                        "Trân trọng,\nĐội ngũ FEShopShoes.");
                
                sendGridMailService.sendMail(request);
            }
        }
    }
}
