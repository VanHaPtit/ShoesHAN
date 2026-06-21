package com.shop.backend.Repository;

import com.shop.backend.Entity.Product;
import com.shop.backend.Entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Tìm tất cả các size/màu của một đôi giày cụ thể
    List<ProductVariant> findByProductId(Long productId);

    Optional<ProductVariant> findByProductAndSizeAndColor(Product product, int size, String color);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(v.stock), 0) FROM ProductVariant v")
    Long sumTotalStock();
}
