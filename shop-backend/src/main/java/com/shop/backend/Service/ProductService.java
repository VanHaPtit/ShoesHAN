package com.shop.backend.Service;

import com.shop.backend.Entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    List<Product> getAll();
    Page<Product> getAllPage(Pageable pageable);
    Product getById(Long id);
    Product create(Product product, List<MultipartFile> files) throws Exception;
    Product update(Long id, Product productDetails, List<MultipartFile> files) throws Exception;
    void delete(Long id);
    void bulkCreate(List<Product> products);
    void importExcel(MultipartFile file) throws Exception;

    List<Product> findByCategoryNameOrGender(String category);

    List<Product> findBySalePriceLessThanBasePrice();

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);
}
