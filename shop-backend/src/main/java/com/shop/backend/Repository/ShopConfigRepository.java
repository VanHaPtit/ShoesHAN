package com.shop.backend.Repository;

import com.shop.backend.Entity.ShopConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopConfigRepository extends JpaRepository<ShopConfig, Long> {
}
