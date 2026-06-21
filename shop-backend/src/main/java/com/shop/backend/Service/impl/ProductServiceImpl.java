package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Product;
import com.shop.backend.Repository.ProductRepository;
import com.shop.backend.Service.CloudinaryService;
import com.shop.backend.Service.ProductService;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import com.shop.backend.Entity.Category;
import com.shop.backend.Entity.Brand;
import com.shop.backend.Repository.CategoryRepository;
import com.shop.backend.Repository.BrandRepository;
import com.shop.backend.Repository.ProductVariantRepository;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private final ProductRepository productRepository;
    @Autowired
    private final CloudinaryService cloudinaryService;
    @Autowired
    private final CategoryRepository categoryRepository;
    @Autowired
    private final BrandRepository brandRepository;
    @Autowired
    private final ProductVariantRepository variantRepository;

    public ProductServiceImpl(ProductRepository productRepository, CloudinaryService cloudinaryService, CategoryRepository categoryRepository, BrandRepository brandRepository, ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.cloudinaryService = cloudinaryService;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    public Page<Product> getAllPage(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public Product getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        Hibernate.initialize(product.getImages()); // Ensure images are fetched
        return product;
    }

    @Override
    @Transactional
    public Product create(Product product, List<MultipartFile> files) throws Exception {
        if (files != null && !files.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                imageUrls.add(cloudinaryService.uploadImage(file));
            }
            product.setImages(imageUrls);
        }
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product update(Long id, Product productDetails, List<MultipartFile> files) throws Exception {
        Product existingProduct = getById(id);

        // Cập nhật các thông tin cơ bản
        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setBasePrice(productDetails.getBasePrice());
        existingProduct.setSalePrice(productDetails.getSalePrice());
        existingProduct.setSlug(productDetails.getSlug());
        existingProduct.setGender(productDetails.getGender());
        existingProduct.setMaterial(productDetails.getMaterial());
        existingProduct.setSoleType(productDetails.getSoleType());
        existingProduct.setOrigin(productDetails.getOrigin());
        existingProduct.setCategory(productDetails.getCategory());
        existingProduct.setBrand(productDetails.getBrand());
        existingProduct.setActive(productDetails.getActive());

        // Logic xử lý ảnh: Nếu có file mới thì thay thế, nếu không thì giữ ảnh cũ
        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            List<String> newImageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                newImageUrls.add(cloudinaryService.uploadImage(file));
            }
            existingProduct.setImages(newImageUrls);
        }
        // Nếu files trống, existingProduct.getImages() vẫn giữ nguyên giá trị cũ

        return productRepository.save(existingProduct);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }
        try {
            // Bước 1: Xóa các phân loại (variants) trước
            List<com.shop.backend.Entity.ProductVariant> variants = variantRepository.findByProductId(id);
            if (!variants.isEmpty()) {
                variantRepository.deleteAll(variants);
                variantRepository.flush(); // Nếu biến thể đã bán (nằm trong OrderItem), lệnh này sẽ quăng lỗi DataIntegrityViolationException
            }
            
            // Bước 2: Xóa sản phẩm
            productRepository.deleteById(id);
            productRepository.flush(); // Bắt lỗi nếu sản phẩm nằm trong Combo, Review...
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Không thể xóa sản phẩm vì đã có đơn hàng/đánh giá liên quan. Vui lòng TẮT KÍCH HOẠT thay vì xóa!");
        }
    }

    @Override
    public List<Product> findByCategoryNameOrGender(String category) {
        return productRepository.findByCategoryNameOrGender(category , category) ;
    }

    @Override
    public List<Product> findBySalePriceLessThanBasePrice() {
        return productRepository.findDiscountedProductsActive();
    }

    @Override
    public List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword) ;
    }

    @Override
    @Transactional
    public void bulkCreate(List<Product> products) {
        for (Product product : products) {
            if (product.getCategory() != null && product.getCategory().getName() != null) {
                Category category = categoryRepository.findByName(product.getCategory().getName())
                        .orElseGet(() -> {
                            Category newCat = new Category();
                            newCat.setName(product.getCategory().getName());
                            return categoryRepository.save(newCat);
                        });
                product.setCategory(category);
            }
            if (product.getBrand() != null && product.getBrand().getName() != null) {
                Brand brand = brandRepository.findByName(product.getBrand().getName())
                        .orElseGet(() -> {
                            Brand newBrand = new Brand();
                            newBrand.setName(product.getBrand().getName());
                            return brandRepository.save(newBrand);
                        });
                product.setBrand(brand);
            }
        }
        productRepository.saveAll(products);
    }

    @Override
    public void importExcel(MultipartFile file) throws Exception {
        // Not used via HTTP, frontend sends JSON
    }
}
