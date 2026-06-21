package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Cart cart;

    @ManyToOne
    private ProductVariant variant;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá không được nhỏ hơn 0")
    private Double price;

    public CartItem(Long id, Cart cart, ProductVariant variant, Integer quantity, Double price) {
        this.id = id;
        this.cart = cart;
        this.variant = variant;
        this.quantity = quantity;
        this.price = price;
    }

    public CartItem() {
    }
}
