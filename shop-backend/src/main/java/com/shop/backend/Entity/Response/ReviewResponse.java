package com.shop.backend.Entity.Response;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.ElementCollection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private Long orderItemId;
    private String username;
    private Integer rating;
    private String comment;
    private Long productId;
    private List<String> images;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime createdAt;
}