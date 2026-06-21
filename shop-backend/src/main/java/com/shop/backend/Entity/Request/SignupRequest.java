package com.shop.backend.Entity.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
import java.util.Set;

public class SignupRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 255, message = "Tên đăng nhập phải từ 3 đến 255 ký tự")
    @Email(message = "Tên đăng nhập phải là định dạng email hợp lệ (chứa ký tự @)")
    private String username; 

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 255, message = "Họ và tên phải từ 2 đến 255 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ")
    private LocalDate dateOfBirth;
    private Set<String> role;

    // Constructor cập nhật
    public SignupRequest(String username, String email, String password, String fullName, String phone, LocalDate dateOfBirth, Set<String> role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.role = role;
    }

    public SignupRequest() {
    }

    // Getter và Setter cho username
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Set<String> getRole() {
        return role;
    }

    public void setRole(Set<String> role) {
        this.role = role;
    }
}