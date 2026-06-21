package com.shop.backend.Entity.Response;

import java.util.List;
import java.time.LocalDate;

public class UserInfoResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private List<String> roles;

    public UserInfoResponse(String token, Long id, String email, String fullName, LocalDate dateOfBirth, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.roles = roles;
    }


    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    // Getters và Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
