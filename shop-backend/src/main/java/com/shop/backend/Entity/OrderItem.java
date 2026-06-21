package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JsonIgnoreProperties({
            "product.description",
            "product.slug",
            "product.material",
            "product.soleType",
            "product.origin",
            "product.images",
            "product.category",
            "product.brand",
            "stock",
            "version"
    })
    private ProductVariant variant;
    @ManyToOne @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Giá tại thời điểm mua không được để trống")
    @Min(value = 0, message = "Giá không được nhỏ hơn 0")
    private Double priceAtPurchase; // Lưu giá tại thời điểm mua để đối soát

    @Column(name = "is_reviewed", columnDefinition = "boolean default false")
    private Boolean isReviewedLegacy = false;

    @Column(name = "reviewed", columnDefinition = "boolean default false")
    private boolean reviewed = false;

    public OrderItem(Long id, ProductVariant variant, Order order, Integer quantity, Double priceAtPurchase, boolean reviewed) {
        this.id = id;
        this.variant = variant;
        this.order = order;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
        this.reviewed = reviewed;
    }

    public OrderItem() {
    }
}
