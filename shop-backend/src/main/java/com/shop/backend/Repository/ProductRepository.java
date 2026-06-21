package com.shop.backend.Repository;

import com.shop.backend.Entity.Category;
import com.shop.backend.Entity.Order;
import com.shop.backend.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryNameOrGender(String categoryName, String gender);
    
    // ĐÃ BÙ LẠI: Thêm lại Annotation truy vấn này để không bị sập lỗi khởi tạo Bean nữa
    @Query("SELECT p FROM Product p WHERE p.salePrice < p.basePrice")
    List<Product> findDiscountedProducts();

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    List<Product> findByNameContainingIgnoreCaseOrMaterialContainingIgnoreCaseAndActiveTrue(String name, String material);

    List<Product> findByCategory_NameAndGender(String categoryName, String gender);

    // ==================== CẤU HÌNH TỐI ƯU CHO CHATBOT AI ====================

    // 1. TÌM KIẾM TOÀN DIỆN (Tên + Chất liệu + Tên Danh mục) - Dành riêng cho ChatBotTools.searchProducts
    @Query("""
        SELECT p FROM Product p 
        WHERE p.active = true 
          AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) 
               OR LOWER(p.material) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.id DESC
    """)
    List<Product> searchActiveByKeywordComprehensive(@Param("keyword") String keyword);

    // 2. Tìm kiếm sản phẩm ACTIVE theo name/material gốc của bạn
    @Query("""
        SELECT p FROM Product p 
        WHERE p.active = true 
          AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) 
               OR LOWER(p.material) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.id DESC
    """)
    List<Product> searchActiveByNameOrMaterial(@Param("keyword") String keyword);

    // Tìm theo Category (tên) + Gender + Active
    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND LOWER(p.category.name) = LOWER(:categoryName)
          AND p.gender = :gender
        ORDER BY p.salePrice ASC
    """)
    List<Product> findByCategoryAndGenderActive(@Param("categoryName") String categoryName,
                                                @Param("gender") String gender);

    // Tìm theo tên exact (ưu tiên cho getProductDetails)
    @Query("""
        SELECT p FROM Product p 
        WHERE p.active = true 
          AND LOWER(p.name) = LOWER(:name)
          ORDER BY p.id DESC
    """)
    List<Product> findActiveByNameExact(@Param("name") String name);

    // Sản phẩm đang giảm giá (chỉ ACTIVE)
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.salePrice < p.basePrice ORDER BY p.salePrice ASC")
    List<Product> findDiscountedProductsActive();

    // Đã sửa lỗi ép kiểu từ chuỗi String sang thực thể Product
    @Query("""
        SELECT p.name FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
    """)
    List<String> findProductNames(@Param("name") String name);
}