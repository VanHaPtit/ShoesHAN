package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "categories")

@Getter
@Setter
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
    private String name;
    private String image;

    public Category(Long id, String name, String image) {
        this.id = id;
        this.name = name;
        this.image = image;
    }

    public Category(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Category() {
    }
}
