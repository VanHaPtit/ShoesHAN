package com.shop.backend.Controller;

import com.shop.backend.Entity.Category;
import com.shop.backend.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/category")
@CrossOrigin("*")

public class CategoryController {

    @Autowired
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Category> create(
            @RequestPart("category") Category category,
            @RequestPart("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(categoryService.create(category, file));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Category> update(
            @PathVariable Long id,
            @RequestPart("category") Category categoryDetails,
            @RequestPart(value = "file", required = false) MultipartFile file // required = false để không bắt buộc phải có file
    ) throws Exception {
        return ResponseEntity.ok(categoryService.update(id, categoryDetails, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok("Đã xóa danh mục thành công!");
    }
}