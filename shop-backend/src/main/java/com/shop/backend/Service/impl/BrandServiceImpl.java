package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Brand;
import com.shop.backend.Service.BrandService;

import java.util.List;
import com.shop.backend.Repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    public List<Brand> getAll() {
        return brandRepository.findAll(); // Lấy toàn bộ danh sách thương hiệu
    }

    @Override
    public Brand getById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));
    }

    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu khi ghi
    public Brand create(Brand brand) {
        return brandRepository.save(brand); // Lưu thương hiệu mới
    }

    @Override
    @Transactional
    public Brand update(Long id, Brand brandDetails) {
        Brand existingBrand = getById(id);

        // Cập nhật các trường thông tin
        existingBrand.setName(brandDetails.getName());

        return brandRepository.save(existingBrand); // Lưu thay đổi
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Không thể xóa: Thương hiệu không tồn tại!");
        }
        brandRepository.deleteById(id); // Xóa theo ID
    }
}