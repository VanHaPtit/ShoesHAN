package com.shop.backend.Config;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        // Giúp AI ghi nhớ tối đa 10 tin nhắn gần nhất của cuộc hội thoại
        return memoryId -> MessageWindowChatMemory.withMaxMessages(10);
    }

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        // ÉP CỨNG BẰNG CODE: Buộc bộ não Llama 3.1 của Cerebras phải chạy ở trạng thái kỷ luật nhất
        return OpenAiChatModel.builder()
                .baseUrl("https://api.cerebras.ai/v1")
                .apiKey("csk-2v8mf69c94vtdxvpcpt85pph4t4hcp8jhk282355h6p2w4jw")
                .modelName("llama3.1-8b")
                .temperature(0.0) // <--- Độ sáng tạo bằng 0, triệt tiêu hoàn toàn lỗi tự chế từ khóa rác
                .logRequests(true)
                .logResponses(true)
                .build();
    }
}