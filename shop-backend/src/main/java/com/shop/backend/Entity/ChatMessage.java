package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne @JoinColumn(name = "session_id")
    private ChatSession session;

    @Column(columnDefinition = "TEXT")
    private String content;
    private String sender; // "USER" hoặc "AI" hoặc "ADMIN"
    private LocalDateTime timestamp = LocalDateTime.now();

    // Helper method for JSON serialization
    public Long getUserId() {
        if (session != null && session.getUser() != null) {
            return session.getUser().getId();
        }
        return null;
    }

    public ChatMessage(Long id, ChatSession session, String content, String sender, LocalDateTime timestamp) {
        this.id = id;
        this.session = session;
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    public ChatMessage() {
    }
}