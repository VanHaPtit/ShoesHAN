package com.shop.backend.Controller;

import com.shop.backend.Entity.Product;
import com.shop.backend.Service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/product")


public class ProductController {

    private final ProductService productService;


    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "false") boolean all
    ) {
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            products = productService.findByCategoryNameOrGender(category);
        } else {
            products = productService.getAll();
        }

        if (!all) {
            products = products.stream()
                    .filter(p -> p.getActive() != null && p.getActive())
                    .toList();
        }
        
        return products;
    }

    @GetMapping("/page")
    public Page<Product> getProductsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productService.getAllPage(pageable);
    }

    @GetMapping("/sales")
    public List<Product> getSaleProducts() {
        // Trả về danh sách từ Service đã xử lý lọc salePrice < basePrice & active = true
        return productService.findBySalePriceLessThanBasePrice();
    }

    @GetMapping("/search")
    public List<Product> searchProduct(@RequestParam String keyWord) {
        return productService.findByNameContainingIgnoreCaseAndActiveTrue(keyWord);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Product> create(
            @Valid @RequestPart("product") Product product,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws Exception {
        return ResponseEntity.ok(productService.create(product, files));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @Valid @RequestPart("product") Product productDetails,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws Exception {
        return ResponseEntity.ok(productService.update(id, productDetails, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            productService.delete(id);
            return ResponseEntity.ok("Xóa sản phẩm thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkCreate(@RequestBody List<Product> products) {
        try {
            productService.bulkCreate(products);
            return ResponseEntity.ok("Import thành công " + products.size() + " sản phẩm");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi import: " + e.getMessage());
        }
    }
}
