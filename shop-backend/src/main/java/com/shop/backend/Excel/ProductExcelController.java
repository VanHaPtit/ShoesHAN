package com.shop.backend.Excel;


import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/Excel")
@RequiredArgsConstructor
public class ProductExcelController {

    private final ProductExcelService productExcelService;

    @PostMapping("/import")
    public ResponseEntity<?> importProducts(@RequestParam("file") MultipartFile file) {
        // 1. Kiểm tra file trống
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn một file ZIP để upload!"));
        }

        // 2. Kiểm tra định dạng file (chỉ chấp nhận .zip)
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".zip")) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("message", "Định dạng file không hợp lệ! Chỉ chấp nhận file .zip"));
        }

        try {
            // 3. Gọi Service để xử lý giải nén và lưu DB
            productExcelService.importFromZip(file);

            return ResponseEntity.ok(Map.of(
                    "message", "Import sản phẩm thành công!",
                    "fileName", fileName
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi trong quá trình xử lý file: " + e.getMessage()));
        }
    }


    @GetMapping("/export-all")
    public ResponseEntity<InputStreamResource> exportAllData() throws IOException {
        String filename = "Shop_System_Report_" + System.currentTimeMillis() + ".xlsx";
        InputStreamResource file = new InputStreamResource(productExcelService.exportAllData());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

}
