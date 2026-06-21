package com.shop.backend.Controller;

import com.shop.backend.Entity.ProductVariant;
import com.shop.backend.Service.ProductVariantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/variant")

public class ProductVariantController {

    private final ProductVariantService variantService;

    public ProductVariantController(ProductVariantService variantService) {
        this.variantService = variantService;
    }

    // Lấy tất cả biến thể của 1 sản phẩm (Ví dụ: /api/variant/product/1)
    @GetMapping("/product/{productId}")
    public List<ProductVariant> getByProduct(@PathVariable Long productId) {
        return variantService.getVariantsByProductId(productId);
    }

    @GetMapping
    public List<ProductVariant> getAll() {
        return variantService.getAll();
    }

    @PostMapping
    public ResponseEntity<ProductVariant> create(@RequestBody ProductVariant variant) {
        return ResponseEntity.ok(variantService.create(variant));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariant> update(@PathVariable Long id, @RequestBody ProductVariant variant) {
        return ResponseEntity.ok(variantService.update(id, variant));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        variantService.delete(id);
        return ResponseEntity.ok("Xóa biến thể thành công!");
    }
}
