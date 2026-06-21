package com.shop.backend.Controller;

import com.shop.backend.Service.ShopConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/config")
@CrossOrigin("*")
public class ShopConfigController {

    @Autowired
    private ShopConfigService shopConfigService;

    // Lấy trạng thái AI
    @GetMapping("/ai-status")
    public ResponseEntity<Boolean> getAiStatus() {
        return ResponseEntity.ok(shopConfigService.isAiEnabled());
    }

    // Toggle trạng thái AI
    @PostMapping("/ai-toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> toggleAiStatus() {
        return ResponseEntity.ok(shopConfigService.toggleAi());
    }

    // Lấy config hiện tại
    @GetMapping("/banner")
    public ResponseEntity<com.shop.backend.Entity.ShopConfig> getBanner() {
        return ResponseEntity.ok(shopConfigService.getConfig());
    }

    // Admin cập nhật banner
    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBanner(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "highlight", required = false) String highlight,
            @RequestParam(value = "desc", required = false) String desc) {
        try {
            com.shop.backend.Entity.ShopConfig config = shopConfigService.updateBanner(file, tag, title, highlight, desc);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật banner: " + e.getMessage());
        }
    }

    // Admin cập nhật thời gian chuyển banner (interval)
    @PutMapping("/banner-interval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBannerInterval(@RequestParam("interval") Integer interval) {
        try {
            com.shop.backend.Entity.ShopConfig config = shopConfigService.updateBannerInterval(interval);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật thời gian: " + e.getMessage());
        }
    }
}
