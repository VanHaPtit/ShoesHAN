package com.shop.backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 255, message = "Tỉnh/Thành phố không được vượt quá 255 ký tự")
    private String province; // Tỉnh / Thành phố

    @Size(max = 255, message = "Phường/Xã không được vượt quá 255 ký tự")
    private String ward; // Phường / Xã

    @Size(max = 500, message = "Địa chỉ cụ thể không được vượt quá 500 ký tự")
    private String specificAddress; // Địa chỉ cụ thể

    @OneToOne(mappedBy = "address")
    @JsonBackReference
    private User user;
}
