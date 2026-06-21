package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;
import java.util.List;

@Entity
@Table(name = "products")
@Getter

@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Giá gốc không được để trống")
    @Min(value = 0, message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private Double basePrice; // Giá gốc

    @Min(value = 0, message = "Giá khuyến mãi phải lớn hơn hoặc bằng 0")
    private Double salePrice; // Giá sau khi giảm (nếu có)

    @Min(value = 0, message = "Số lượng đã bán không được âm")
    private Integer totalSold = 0;

    @ManyToOne @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne @JoinColumn(name = "brand_id")
    private Brand brand;

    @ElementCollection // Lưu danh sách URL ảnh
    private List<String> images;

    private String slug; // /san-pham/iphone-15-pro
    private Boolean active = true;

    private String gender;      // MEN, WOMEN, UNISEX
    private String material;    // Leather, Mesh...
    private String soleType;    // Rubber, Boost...
    private String origin;      // Vietnam, China...

    public Product(Long id, String name, String description, Double basePrice, Double salePrice,  Integer totalSold, Category category, Brand brand, List<String> images, String slug, Boolean active, String gender, String material, String soleType, String origin) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.salePrice = salePrice;
        this.totalSold = totalSold;
        this.category = category;
        this.brand = brand;
        this.images = images;
        this.slug = slug;
        this.active = active;
        this.gender = gender;
        this.material = material;
        this.soleType = soleType;
        this.origin = origin;
    }

    public Product() {
    }
}
