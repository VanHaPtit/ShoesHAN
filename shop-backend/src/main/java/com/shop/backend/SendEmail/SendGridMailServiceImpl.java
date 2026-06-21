package com.shop.backend.SendEmail;

import com.sendgrid.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;

@Service
public class SendGridMailServiceImpl implements SendGridMailService {

    @Value("${send_grid.api_key}")
    private String sendGridApiKey;

    @Value("${send_grid.from_email}")
    private String sendGridFromEmail;

    @Value("${send_grid.from_name}")
    private String sendGridFromName;

    @Override
    public void sendMail(EmailRequest emailRequest) {
        Mail mail = buildMail(emailRequest);
        send(mail);
    }

    private Mail buildMail(EmailRequest request) {
        Mail mail = new Mail();

        // Cấu hình người gửi (Đã verify trên SendGrid)
        Email from = new Email();
        from.setName(sendGridFromName);
        from.setEmail(sendGridFromEmail);
        mail.setFrom(from);

        mail.setSubject(request.getSubject());

        // Cấu hình người nhận
        Personalization personalization = new Personalization();
        Email to = new Email();
        to.setEmail(request.getToEmail());
        personalization.addTo(to);
        mail.addPersonalization(personalization);

        // Cấu hình nội dung (dạng text/plain)
        Content content = new Content();
        content.setType("text/plain");
        content.setValue(request.getContent());
        mail.addContent(content);

        return mail;
    }

    private void send(Mail mail) {
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // Lưu ý: Đã bỏ X-Mock để gửi email THẬT
            Response response = sg.api(request);

            System.out.println("Status Code: " + response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                System.out.println("Error Body: " + response.getBody());
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
}
