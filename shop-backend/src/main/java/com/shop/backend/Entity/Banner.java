package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "banners")
@Getter
@Setter
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bannerUrl;
    private String bannerTag;
    private String bannerTitle;
    private String bannerHighlight;

    @Column(columnDefinition = "TEXT")
    private String bannerDescription;

    private Boolean active = true;

    private Integer displayOrder = 0;
}
