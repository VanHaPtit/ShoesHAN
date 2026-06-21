package com.shop.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter

public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user; // Giỏ hàng này thuộc về ai?

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<CartItem> items = new ArrayList<>();

    private Double totalBill = 0.0;

    public Cart(Long id, User user, List<CartItem> items, Double totalBill) {
        this.id = id;
        this.user = user;
        this.items = items;
        this.totalBill = totalBill;
    }

    public Cart() {
    }
}
