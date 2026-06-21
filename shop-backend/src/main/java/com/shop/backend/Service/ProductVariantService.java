package com.shop.backend.Service;

import com.shop.backend.Entity.ProductVariant;

import java.util.List;

public interface ProductVariantService {
    List<ProductVariant> getVariantsByProductId(Long productId);
    List<ProductVariant> getAll();
    ProductVariant getById(Long id);
    ProductVariant create(ProductVariant variant);
    ProductVariant update(Long id, ProductVariant variantDetails);
    void delete(Long id);
}
