package com.shop.backend.Service;

import com.shop.backend.Entity.ShopConfig;
import com.shop.backend.Repository.ShopConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ShopConfigService {

    @Autowired
    private ShopConfigRepository shopConfigRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public boolean isAiEnabled() {
        return shopConfigRepository.findById(1L)
                .map(ShopConfig::getAiEnabled)
                .orElse(true); // Mặc định bật nếu chưa có record
    }

    public boolean toggleAi() {
        ShopConfig config = shopConfigRepository.findById(1L).orElse(new ShopConfig(true));
        config.setId(1L);
        config.setAiEnabled(!config.getAiEnabled());
        shopConfigRepository.save(config);
        return config.getAiEnabled();
    }

    public ShopConfig getConfig() {
        return shopConfigRepository.findById(1L).orElseGet(() -> {
            ShopConfig config = new ShopConfig(true);
            config.setId(1L);
            return shopConfigRepository.save(config);
        });
    }

    public ShopConfig updateBanner(MultipartFile file, String tag, String title, String highlight, String desc) throws Exception {
        ShopConfig config = getConfig();
        if (file != null && !file.isEmpty()) {
            String url = cloudinaryService.uploadImage(file);
            config.setBannerUrl(url);
        }
        if (tag != null) config.setBannerTag(tag);
        if (title != null) config.setBannerTitle(title);
        if (highlight != null) config.setBannerHighlight(highlight);
        if (desc != null) config.setBannerDescription(desc);
        
        return shopConfigRepository.save(config);
    }

    public ShopConfig updateBannerInterval(Integer interval) {
        ShopConfig config = getConfig();
        if (interval != null && interval >= 1) {
            config.setBannerInterval(interval);
        }
        return shopConfigRepository.save(config);
    }
}
