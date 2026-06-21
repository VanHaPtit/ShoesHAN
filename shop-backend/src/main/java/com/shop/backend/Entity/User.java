package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, message = "Tên đăng nhập ít nhất 3 ký tự")
    private String username;

    private String imageAvt;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 255, message = "Họ và tên phải từ 2 đến 255 ký tự")
    private String fullName;

    @Pattern(regexp = "^$|^(0[3|5|7|8|9])([0-9]{8})$|^(84)([0-9]{9})$",
            message = "Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678)")
    private String phone;

    private Boolean enabled = true;
    private String verificationCode;
    private LocalDateTime createdAt;

    @Past(message = "Ngày sinh phải ở quá khứ")
    private LocalDate dateOfBirth;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;
}