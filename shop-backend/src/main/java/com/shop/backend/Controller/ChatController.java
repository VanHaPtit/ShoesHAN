package com.shop.backend.Controller;

import com.shop.backend.Entity.ChatMessage;
import com.shop.backend.Entity.ChatSession;
import com.shop.backend.Entity.Request.ChatReplyRequest;
import com.shop.backend.Entity.Request.ChatRequest;
import com.shop.backend.Entity.User;
import com.shop.backend.Repository.ChatMessageRepository;
import com.shop.backend.Repository.ChatSessionRepository;
import com.shop.backend.Repository.UserRepository;
import com.shop.backend.Security.UserIdContext;
import com.shop.backend.Service.ShoeShopAssistant;
import com.shop.backend.Service.ShopConfigService;
import com.shop.backend.Service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin("*")
public class ChatController {

    private final ShoeShopAssistant assistant;
    private final SimpMessagingTemplate messagingTemplate;
    private final ShopConfigService shopConfigService;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatController(ShoeShopAssistant assistant, SimpMessagingTemplate messagingTemplate, ShopConfigService shopConfigService, ChatSessionRepository chatSessionRepository, ChatMessageRepository chatMessageRepository, UserRepository userRepository) {
        this.assistant = assistant;
        this.messagingTemplate = messagingTemplate;
        this.shopConfigService = shopConfigService;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    // API Cho Admin bật/tắt AI
    @PostMapping("/toggle-ai")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleAi() {
        boolean newState = shopConfigService.toggleAi();
        return ResponseEntity.ok("AI Chatbot Enabled: " + newState);
    }

    // API Lấy lịch sử chat
    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
        UserDetailsImpl userDetails = (UserDetailsImpl) token.getPrincipal();

        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            // Nếu là Admin, trả về toàn bộ lịch sử chat của tất cả user để AdminPanel có
            // thể hiển thị danh sách
            return ResponseEntity.ok(chatMessageRepository.findAll());
        } else {
            // Nếu là User, chỉ trả về tin nhắn của chính họ
            return ResponseEntity.ok(chatMessageRepository.findBySessionUserId(userDetails.getId()));
        }
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatRequest request, Principal principal) {
        if (principal == null)
            return; // Bảo mật: Không có token thì không xử lý

        UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
        UserDetailsImpl userDetails = (UserDetailsImpl) token.getPrincipal();
        Long userId = userDetails.getId(); // Lấy ID người dùng hiện tại

        // 1. Lưu tin nhắn của User vào database
        ChatSession session = getOrCreateSession(userId);
        ChatMessage userMsg = new ChatMessage(null, session, request.getContent(), "USER", LocalDateTime.now());
        chatMessageRepository.save(userMsg); //

        // Phát tới Admin qua WebSocket để theo dõi real-time
        messagingTemplate.convertAndSend("/topic/admin/chat", userMsg);

        // Phát lại cho chính User để hiển thị tin nhắn vừa gửi
        messagingTemplate.convertAndSend("/topic/user/" + userId, userMsg);

        // 2. Xử lý AI Agent
        if (shopConfigService.isAiEnabled()) { // Kiểm tra AI có đang bật không
            try {
                // QUAN TRỌNG: Thiết lập Context để các @Tool trong ChatBotTools
                // có thể truy cập đúng dữ liệu của user này
                UserIdContext.setUserId(userId);

                // assistant.chat() sẽ thực hiện vòng lặp:
                // Gọi AI -> AI yêu cầu gọi Tool -> Thực thi Tool trong ChatBotTools ->
                // Trả kết quả cho AI -> AI trả về câu văn bản cuối cùng.
                String aiReply = assistant.chat(request.getContent());

                // 3. Lưu và phát tin nhắn phản hồi của AI
                ChatMessage aiMsg = new ChatMessage(null, session, aiReply, "AI", LocalDateTime.now());
                chatMessageRepository.save(aiMsg); //

                // Phát cho User và Admin
                messagingTemplate.convertAndSend("/topic/user/" + userId, aiMsg);
                messagingTemplate.convertAndSend("/topic/admin/chat", aiMsg);

            } catch (Exception e) {
                e.printStackTrace(); // Log lỗi để debug
                ChatMessage errorMsg = new ChatMessage(null, session, 
                    "🤖 Trợ lý AI đang xử lý hơi chậm hoặc gặp sự cố kết nối. Bạn vui lòng thử lại câu hỏi nhé!", 
                    "AI", LocalDateTime.now());
                messagingTemplate.convertAndSend("/topic/user/" + userId, errorMsg);
            } finally {
                // Bắt buộc xóa Context để tránh rò rỉ dữ liệu giữa các thread
                UserIdContext.clear();
            }
        }
    }

    // WebSocket cho Admin gửi câu trả lời thủ công
    @MessageMapping("/chat.reply")
    public void adminReply(@Payload ChatReplyRequest request, Principal principal) {
        if (principal == null) return;
        
        UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
        UserDetailsImpl userDetails = (UserDetailsImpl) token.getPrincipal();
        if (userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return; // Chỉ Admin mới được dùng API này
        }

        ChatSession session = getOrCreateSession(request.getTargetUserId());

        ChatMessage adminMsg = new ChatMessage(null, session, request.getContent(), "ADMIN", LocalDateTime.now());
        chatMessageRepository.save(adminMsg);

        // Gửi thẳng về cho User
        messagingTemplate.convertAndSend("/topic/user/" + request.getTargetUserId(), adminMsg);
        // Ghi lại trên kênh admin để các admin/nhân viên khác thấy
        messagingTemplate.convertAndSend("/topic/admin/chat", adminMsg);
    }

    // --- API REST CHO POSTMAN TEST NHANH (Không cần kết nối WebSocket) ---
    @PostMapping("/test-send")
    public ResponseEntity<?> testSendMessageRest(@RequestBody ChatRequest request, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
        UserDetailsImpl userDetails = (UserDetailsImpl) token.getPrincipal();
        Long userId = userDetails.getId();

        ChatSession session = getOrCreateSession(userId);
        ChatMessage userMsg = new ChatMessage(null, session, request.getContent(), "USER", LocalDateTime.now());
        chatMessageRepository.save(userMsg);

        if (shopConfigService.isAiEnabled()) {
            try {
                UserIdContext.setUserId(userId);
                String aiReply = assistant.chat(request.getContent());

                ChatMessage aiMsg = new ChatMessage(null, session, aiReply, "AI", LocalDateTime.now());
                chatMessageRepository.save(aiMsg);

                return ResponseEntity.ok(aiMsg);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("Lỗi AI: " + e.getMessage());
            } finally {
                UserIdContext.clear();
            }
        }
        return ResponseEntity.ok(userMsg);
    }

    private ChatSession getOrCreateSession(Long userId) {
        return chatSessionRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            ChatSession newSession = new ChatSession();
            newSession.setUser(user);
            newSession.setCreatedAt(LocalDateTime.now());
            return chatSessionRepository.save(newSession);
        });
    }
}