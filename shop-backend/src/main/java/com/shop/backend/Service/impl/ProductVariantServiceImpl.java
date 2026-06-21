package com.shop.backend.Service.impl;

import com.shop.backend.Entity.ProductVariant;
import com.shop.backend.Repository.ProductVariantRepository;
import com.shop.backend.Service.ProductVariantService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductVariantServiceImpl implements ProductVariantService {

    @Autowired
    private final ProductVariantRepository variantRepository;

    public ProductVariantServiceImpl(ProductVariantRepository variantRepository) {
        this.variantRepository = variantRepository;
    }

    @Override
    public List<ProductVariant> getVariantsByProductId(Long productId) {
        return variantRepository.findByProductId(productId);
    }

    @Override
    public List<ProductVariant> getAll() {
        return variantRepository.findAll();
    }

    @Override
    public ProductVariant getById(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể ID: " + id));
    }

    @Override
    @Transactional
    public ProductVariant create(ProductVariant variant) {
        // Database sẽ tự kiểm tra UniqueConstraint (product_id, size, color) ở đây
        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public ProductVariant update(Long id, ProductVariant variantDetails) {
        ProductVariant existing = getById(id);

        existing.setSize(variantDetails.getSize());
        existing.setColor(variantDetails.getColor());
        existing.setStock(variantDetails.getStock());
        existing.setPrice(variantDetails.getPrice());

        return variantRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!variantRepository.existsById(id)) {
            throw new RuntimeException("Biến thể không tồn tại!");
        }
        variantRepository.deleteById(id);
    }
}
