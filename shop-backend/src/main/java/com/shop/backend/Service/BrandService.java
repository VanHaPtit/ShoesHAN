package com.shop.backend.Service;

import com.shop.backend.Entity.Brand;
import com.shop.backend.Service.impl.BrandServiceImpl;

import java.util.List;

public interface BrandService  {
    List<Brand> getAll();
    Brand getById(Long id);
    Brand create(Brand brand);
    Brand update(Long id, Brand brand);
    void delete(Long id);
}
