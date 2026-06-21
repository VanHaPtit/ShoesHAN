package com.shop.backend.Controller;


import com.shop.backend.Entity.Brand;
import com.shop.backend.Service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brand")
@CrossOrigin("*")
public class BrandController {

    @Autowired
    private BrandService brandService;

    // 1. Lấy toàn bộ danh sách thương hiệu
    @GetMapping
    public List<Brand> getAll() {
        return brandService.getAll();
    }

    // 2. Lấy chi tiết một thương hiệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getById(id));
    }

    // 3. Tạo mới thương hiệu
    @PostMapping
    public Brand create(@Valid @RequestBody Brand brand) {
        return brandService.create(brand);
    }

    // 4. Cập nhật thương hiệu
    @PutMapping("/{id}")
    public Brand update(@PathVariable Long id, @Valid @RequestBody Brand brandDetails) {
        return brandService.update(id, brandDetails);
    }

    // 5. Xóa thương hiệu
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok("Đã xóa thương hiệu thành công!");
    }

}
