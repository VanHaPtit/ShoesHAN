package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shop_configs")
@Getter
@Setter
public class ShopConfig {
    @Id
    private Long id = 1L; // Bảng này chỉ có 1 dòng duy nhất (Singleton)

    private Boolean aiEnabled = true;

    @Column(name = "banner_interval")
    private Integer bannerInterval = 5000; // Mặc định 5 giây

    private String bannerUrl; // Thêm bannerURL
    
    private String bannerTag;
    private String bannerTitle;
    private String bannerHighlight;
    @Column(columnDefinition = "TEXT")
    private String bannerDescription;

    public ShopConfig() {
    }

    public ShopConfig(Boolean aiEnabled) {
        this.aiEnabled = aiEnabled;
    }
}
