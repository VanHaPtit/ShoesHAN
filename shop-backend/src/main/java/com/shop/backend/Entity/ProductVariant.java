package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Getter
@Setter
@Table(name = "product_variants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id","size","color"}))
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Product product;

    @NotNull(message = "Kích cỡ không được để trống")
    @Min(value = 1, message = "Kích cỡ phải lớn hơn 0")
    private Integer size;     // 38,39,40...

    @NotBlank(message = "Màu sắc không được để trống")
    private String color;     // Black, White

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được nhỏ hơn 0")
    private Integer stock;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá không được nhỏ hơn 0")
    private Double price;     // cho phép lệch giá theo size

    @Version // Trường này giúp kiểm soát xung đột
    private Long version;

    public ProductVariant(Product product, Integer size, String color, Integer stock, Double price, Long version) {
        this.product = product;
        this.size = size;
        this.color = color;
        this.stock = stock;
        this.price = price;
        this.version = version;
    }

    public ProductVariant(Long id, Product product, Integer size, String color, Integer stock, Double price, Long version) {
        this.id = id;
        this.product = product;
        this.size = size;
        this.color = color;
        this.stock = stock;
        this.price = price;
        this.version = version;
    }

    public ProductVariant(Long id, Product product, Integer size, String color, Integer stock, Double price) {
        this.id = id;
        this.product = product;
        this.size = size;
        this.color = color;
        this.stock = stock;
        this.price = price;
    }

    public ProductVariant() {
    }
}