package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "brands")
@Getter
@Setter
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên thương hiệu không được để trống")
    @Size(max = 255, message = "Tên thương hiệu không được vượt quá 255 ký tự")
    private String name;

    public Brand(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Brand() {
    }
}
