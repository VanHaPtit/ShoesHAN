package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "combos")
@Getter
@Setter
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên combo không được để trống")
    @Size(max = 255, message = "Tên combo không được vượt quá 255 ký tự")
    private String name;

    @NotNull(message = "Giá combo không được để trống")
    @Min(value = 0, message = "Giá combo phải lớn hơn hoặc bằng 0")
    private Double comboPrice; // Giá khi mua cả bộ

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @ManyToMany
    @JoinTable(name = "combo_products", joinColumns = @JoinColumn(name = "combo_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    @Size(min = 2, message = "Combo phải có ít nhất 2 sản phẩm")
    private List<Product> products;

    public Combo(Long id, String name, Double comboPrice, LocalDateTime startDate, LocalDateTime endDate, List<Product> products) {
        this.id = id;
        this.name = name;
        this.comboPrice = comboPrice;
        this.startDate = startDate;
        this.endDate = endDate;
        this.products = products;
    }

    public Combo() {
    }
}