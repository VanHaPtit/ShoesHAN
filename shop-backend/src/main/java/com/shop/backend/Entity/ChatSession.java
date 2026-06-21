package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "user_id")
    private User user;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<ChatMessage> messages;

    public ChatSession(Long id, User user, LocalDateTime createdAt, List<ChatMessage> messages) {
        this.id = id;
        this.user = user;
        this.createdAt = createdAt;
        this.messages = messages;
    }

    public ChatSession() {
    }
}
