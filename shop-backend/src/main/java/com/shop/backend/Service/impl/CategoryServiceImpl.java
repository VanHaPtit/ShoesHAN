package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Category;
import com.shop.backend.Repository.CategoryRepository;
import com.shop.backend.Service.CategoryService;
import com.shop.backend.Service.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private final CategoryRepository categoryRepository;

    @Autowired
    private final CloudinaryService cloudinaryService ;

    @Override
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    }

    @Override
    @Transactional
    public Category create(Category category , MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            // Upload lên Cloudinary
            String ImgUrl = cloudinaryService.uploadImage(file);
            // Gán URL trả về vào đối tượng nhân viên
            category.setImage(ImgUrl);
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category update(Long id, Category categoryDetails, MultipartFile file) throws Exception {
        Category existingCategory = getById(id);
        existingCategory.setName(categoryDetails.getName());
        if (file != null && !file.isEmpty()) {
            // Có ảnh mới -> Upload lên Cloudinary
            String newImgUrl = cloudinaryService.uploadImage(file);
            existingCategory.setImage(newImgUrl);
        }
        // Nếu file == null hoặc file rỗng -> KHÔNG làm gì cả
        // existingCategory.getImage() vẫn giữ nguyên giá trị cũ đã lấy từ DB ở bước 1.

        return categoryRepository.save(existingCategory);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không thể xóa: Danh mục không tồn tại!");
        }
        categoryRepository.deleteById(id);
    }
}
