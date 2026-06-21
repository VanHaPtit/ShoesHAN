package com.shop.backend.Service;

import com.shop.backend.Entity.Category;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CategoryService {
    List<Category> getAll();
    Category getById(Long id);
    Category create(Category category , MultipartFile file) throws IOException;
    Category update(Long id, Category categoryDetails, MultipartFile file) throws Exception;
    void delete(Long id);
}
