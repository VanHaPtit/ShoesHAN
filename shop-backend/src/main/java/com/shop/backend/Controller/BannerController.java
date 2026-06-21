package com.shop.backend.Controller;

import com.shop.backend.Entity.Banner;
import com.shop.backend.Repository.BannerRepository;
import com.shop.backend.Service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@CrossOrigin("*")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAll() {
        return ResponseEntity.ok(bannerRepository.findAllByOrderByDisplayOrderAsc());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActive() {
        return ResponseEntity.ok(bannerRepository.findByActiveTrueOrderByDisplayOrderAsc());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Banner> create(
            @RequestPart("banner") Banner banner,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        if (file != null && !file.isEmpty()) {
            String url = cloudinaryService.uploadImage(file);
            banner.setBannerUrl(url);
        }
        if (banner.getDisplayOrder() != null && banner.getDisplayOrder() < 0) {
            return ResponseEntity.badRequest().body(null);
        }
        if (banner.getDisplayOrder() == null) {
            banner.setDisplayOrder(0);
        }
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Banner> update(
            @PathVariable Long id,
            @RequestPart("banner") Banner bannerDetails,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner không tồn tại"));

        if (file != null && !file.isEmpty()) {
            String url = cloudinaryService.uploadImage(file);
            banner.setBannerUrl(url);
        } else if (bannerDetails.getBannerUrl() != null) {
            banner.setBannerUrl(bannerDetails.getBannerUrl());
        }

        banner.setBannerTag(bannerDetails.getBannerTag());
        banner.setBannerTitle(bannerDetails.getBannerTitle());
        banner.setBannerHighlight(bannerDetails.getBannerHighlight());
        banner.setBannerDescription(bannerDetails.getBannerDescription());
        banner.setActive(bannerDetails.getActive());
        
        if (bannerDetails.getDisplayOrder() != null && bannerDetails.getDisplayOrder() < 0) {
            return ResponseEntity.badRequest().body(null);
        }
        banner.setDisplayOrder(bannerDetails.getDisplayOrder() != null ? bannerDetails.getDisplayOrder() : 0);

        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        return ResponseEntity.ok("Xóa banner thành công");
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Banner> toggleActive(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id).orElseThrow();
        banner.setActive(!banner.getActive());
        return ResponseEntity.ok(bannerRepository.save(banner));
    }
}
