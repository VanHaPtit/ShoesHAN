package com.shop.backend.Service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        // 1. Dọn tên file: Lấy tên gốc và xóa đuôi file để tránh lỗi .png.png
        String originalName = file.getOriginalFilename();
        String fileNameOnly = "file_" + System.currentTimeMillis();

        if (originalName != null && originalName.contains(".")) {
            // Chỉ lấy phần tên trước dấu chấm cuối cùng
            fileNameOnly = originalName.substring(0, originalName.lastIndexOf("."));
            // Làm sạch tên: xóa khoảng trắng và ký tự đặc biệt
            fileNameOnly = fileNameOnly.replace(" ", "_").replaceAll("[^a-zA-Z0-9_-]", "");
        }

        // 2. Thực hiện upload
        Map upload = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "shop_assets",
                        "public_id", fileNameOnly,
                        "overwrite", true // Ghi đè nếu trùng tên
                )
        );

        return upload.get("secure_url").toString();
    }


    // Trong CloudinaryService.java
    public String uploadImageForExcel(byte[] fileBytes, String fileName) throws IOException {
        String publicId = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf(".")) : fileName;
        publicId = publicId.replace(" ", "_").replaceAll("[^a-zA-Z0-9_-]", "");

        Map upload = cloudinary.uploader().upload(
                fileBytes,
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "shop_assets",
                        "public_id", publicId + "_" + System.currentTimeMillis(),
                        "overwrite", true
                )
        );
        return upload.get("secure_url").toString();
    }

}

