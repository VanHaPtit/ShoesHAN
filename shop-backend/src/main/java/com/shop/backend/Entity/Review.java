package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"order_item_id"})
        }
)
@Getter
@Setter
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne @JoinColumn(name = "product_id")
    private Product product;

    @NotNull(message = "Đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private Integer rating; // 1 - 5

    @Size(max = 1000, message = "Bình luận không được vượt quá 1000 ký tự")
    private String comment;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime createdAt;

    @ElementCollection // Lưu danh sách URL ảnh
    private List<String> images;

    public Review(Long id, User user, Product product, Integer rating, String comment, LocalDateTime createdAt, List<String> images) {
        this.id = id;
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.images = images;
    }

    public Review(Long id, User user, Product product, Integer rating, String comment) {
        this.id = id;
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
    }

    public Review() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}