package com.shop.backend.SendEmail;

public class QualifiedUserResponse {
    private Long userId;
    private String email;
    private int paidCount;

    public QualifiedUserResponse(Long userId, int paidCount) {
        this.userId = userId;
        this.paidCount = paidCount;
    }

    public QualifiedUserResponse(Long userId, String email, int paidCount) {
        this.userId = userId;
        this.email = email;
        this.paidCount = paidCount;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getPaidCount() {
        return paidCount;
    }

    public void setPaidCount(int paidCount) {
        this.paidCount = paidCount;
    }
}
