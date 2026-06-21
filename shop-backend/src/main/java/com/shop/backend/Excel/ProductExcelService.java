package com.shop.backend.Excel;

import com.shop.backend.Entity.Brand;
import com.shop.backend.Entity.Category;
import com.shop.backend.Entity.Product;
import com.shop.backend.Entity.ProductVariant;
import com.shop.backend.Repository.BrandRepository;
import com.shop.backend.Repository.CategoryRepository;
import com.shop.backend.Repository.ProductRepository;
import com.shop.backend.Repository.ProductVariantRepository;
import com.shop.backend.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class ProductExcelService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public void importFromZip(MultipartFile zipFile) throws Exception {
        Map<String, byte[]> imageMap = new HashMap<>();
        byte[] fileBytes = null;
        boolean isCsv = false;

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();
                if (entryName.toLowerCase().endsWith(".xlsx") || entryName.toLowerCase().endsWith(".xls")) {
                    fileBytes = zis.readAllBytes();
                    isCsv = false;
                } else if (entryName.toLowerCase().endsWith(".csv")) {
                    fileBytes = zis.readAllBytes();
                    isCsv = true;
                } else if (entryName.contains("images/") && !entry.isDirectory()) {
                    String rawFileName = entryName.substring(entryName.lastIndexOf("/") + 1);
                    String cleanKey = removeExtension(rawFileName).toLowerCase().trim();
                    if (!cleanKey.isEmpty()) {
                        imageMap.put(cleanKey, zis.readAllBytes());
                    }
                }
            }
        }

        if (fileBytes == null) throw new RuntimeException("Không tìm thấy file Excel (.xlsx) hoặc file .csv trong file ZIP!");

        List<String[]> dataRows = extractDataRows(fileBytes, isCsv);
        Map<String, Product> productCache = new HashMap<>();

        for (String[] row : dataRows) {
            if (row.length == 0 || row[0].trim().isEmpty()) continue;

            String rawName = row[0];
            String normalizedName = rawName.trim().toLowerCase();
            String slug = generateSlug(rawName);

            Product product = productCache.get(normalizedName);
            if (product == null) {
                product = productRepository.findActiveByNameExact(normalizedName)
                        .stream().findFirst().orElse(new Product());

                product.setName(rawName);
                product.setSlug(slug);
                product.setDescription(row.length > 2 ? row[2] : "");
                product.setBasePrice(parseDoubleSafe(row.length > 3 ? row[3] : "0"));
                product.setSalePrice(parseDoubleSafe(row.length > 4 ? row[4] : "0"));
                product.setGender(row.length > 5 ? row[5] : "");
                product.setMaterial(row.length > 6 ? row[6] : "");
                product.setSoleType(row.length > 7 ? row[7] : "");
                product.setOrigin(row.length > 8 ? row[8] : "");
                product.setActive(parseBooleanSafe(row.length > 9 ? row[9] : "false"));

                String rawCatName = row.length > 12 ? row[12] : "";
                String normCatName = rawCatName.trim().toLowerCase();
                String catImage = row.length > 13 ? row[13] : "";

                if (!rawCatName.isEmpty()) {
                    Category cat = categoryRepository.findByName(normCatName)
                            .orElseGet(() -> categoryRepository.save(new Category(null, rawCatName, catImage)));
                    product.setCategory(cat);
                }

                String rawBrandName = row.length > 14 ? row[14] : "";
                String normBrandName = rawBrandName.trim().toLowerCase();

                if (!rawBrandName.isEmpty()) {
                    Brand brand = brandRepository.findByName(normBrandName)
                            .orElseGet(() -> brandRepository.save(new Brand(null, rawBrandName)));
                    product.setBrand(brand);
                }

                String imgNamesStr = row.length > 11 ? row[11] : "";
                List<String> uploadedUrls = new ArrayList<>();
                for (String excelImgName : imgNamesStr.split(",")) {
                    String cleanVal = excelImgName.trim();
                    if (cleanVal.isEmpty()) continue;
                    
                    // Nếu là link ảnh đã có sẵn (từ file export ra), giữ nguyên không cần upload lại
                    if (cleanVal.startsWith("http://") || cleanVal.startsWith("https://")) {
                        uploadedUrls.add(cleanVal);
                    } else {
                        // Nếu là tên file cục bộ (ví dụ: nike-1.jpg), tìm trong file ZIP để upload
                        String cleanExcelName = removeExtension(cleanVal).toLowerCase();
                        byte[] imgData = imageMap.get(cleanExcelName);
                        if (imgData != null) {
                            uploadedUrls.add(cloudinaryService.uploadImageForExcel(imgData, cleanExcelName));
                        }
                    }
                }
                product.setImages(uploadedUrls);

                product = productRepository.save(product);
                productCache.put(normalizedName, product);
            }

            int size = parseIntSafe(row.length > 15 ? row[15] : "0");
            String color = row.length > 16 ? row[16] : "";
            ProductVariant variant = variantRepository.findByProductAndSizeAndColor(product, size, color)
                    .orElse(new ProductVariant());

            variant.setProduct(product);
            variant.setSize(size);
            variant.setColor(color);
            variant.setPrice(parseDoubleSafe(row.length > 17 ? row[17] : "0"));
            variant.setStock(parseIntSafe(row.length > 18 ? row[18] : "0"));

            variantRepository.save(variant);
        }
    }

    private List<String[]> extractDataRows(byte[] fileBytes, boolean isCsv) throws Exception {
        List<String[]> dataRows = new ArrayList<>();
        if (isCsv) {
            String content = new String(fileBytes, java.nio.charset.StandardCharsets.UTF_8);
            String[] lines = content.split("\\r?\\n");
            for (int i = 1; i < lines.length; i++) { // Bỏ qua dòng Header
                String line = lines[i];
                if (line.trim().isEmpty()) continue;
                List<String> cols = new ArrayList<>();
                StringBuilder sb = new StringBuilder();
                boolean inQuotes = false;
                for (int j = 0; j < line.length(); j++) {
                    char c = line.charAt(j);
                    if (c == '\"') {
                        inQuotes = !inQuotes;
                    } else if (c == ',' && !inQuotes) {
                        cols.add(sb.toString().trim());
                        sb.setLength(0);
                    } else {
                        sb.append(c);
                    }
                }
                cols.add(sb.toString().trim());
                dataRows.add(cols.toArray(new String[0]));
            }
        } else {
            Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(fileBytes));
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getCell(0) == null) continue;
                String[] cols = new String[20];
                for (int c = 0; c < 20; c++) {
                    Cell cell = row.getCell(c);
                    if (cell == null) {
                        cols[c] = "";
                    } else if (cell.getCellType() == CellType.NUMERIC) {
                        cols[c] = String.valueOf(cell.getNumericCellValue());
                    } else if (cell.getCellType() == CellType.BOOLEAN) {
                        cols[c] = String.valueOf(cell.getBooleanCellValue());
                    } else {
                        cols[c] = cell.getStringCellValue();
                    }
                }
                dataRows.add(cols);
            }
            workbook.close();
        }
        return dataRows;
    }

    private double parseDoubleSafe(String val) {
        if (val == null || val.trim().isEmpty()) return 0.0;
        try { return Double.parseDouble(val.trim()); } catch (Exception e) { return 0.0; }
    }

    private int parseIntSafe(String val) {
        if (val == null || val.trim().isEmpty()) return 0;
        try { return (int) Double.parseDouble(val.trim()); } catch (Exception e) { return 0; }
    }

    private boolean parseBooleanSafe(String val) {
        if (val == null) return false;
        String s = val.trim().toLowerCase();
        return s.equals("true") || s.equals("1") || s.equals("có") || s.equals("yes");
    }

    // Hàm phụ để xóa đuôi file (ví dụ: .jpg, .png)
    private String removeExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return fileName;
        return fileName.substring(0, fileName.lastIndexOf("."));
    }




    public String generateSlug(String input) {
        if (input == null || input.isEmpty()) return "";

        // 1. Chuyển về chữ thường
        String nowhitespace = input.toLowerCase(Locale.ROOT).trim();

        // 2. Xử lý riêng chữ 'đ' vì Normalizer không xử lý được
        nowhitespace = nowhitespace.replace("đ", "d");

        // 3. Loại bỏ dấu tiếng Việt (Normalizer)
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");

        // 4. Thay thế các ký tự không phải chữ cái/số bằng dấu gạch ngang
        slug = slug.replaceAll("[^a-z0-9\\s]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-+", "-");

        return slug;
    }

    public ByteArrayInputStream exportAllData() throws IOException {
        String[] headers = {
                "Tên SP", "Slug (Hệ thống)", "Mô tả", "Giá Gốc", "Giá Sale",
                "Giới Tính", "Chất Liệu", "Loại Đế", "Xuất Xứ", "Active",
                "Đã Bán (System)", "Link Ảnh Cloudinary", "Danh Mục", "Ảnh Danh Mục",
                "Thương Hiệu", "Size", "Màu", "Giá Variant", "Kho Hiện Tại", "Version"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Full System Data");

            // 1. TẠO STYLE VÀ FONT ĐỂ HỖ TRỢ TIẾNG VIỆT
            XSSFFont font = ((XSSFWorkbook) workbook).createFont();
            font.setFontName("Times New Roman"); // Font chuẩn hỗ trợ tốt UTF-8
            font.setFontHeightInPoints((short) 12);

            CellStyle bodyStyle = workbook.createCellStyle();
            bodyStyle.setFont(font);
            bodyStyle.setWrapText(true); // Tự động xuống dòng cho phần Mô tả

            // Style riêng cho Header (In đậm)
            CellStyle headerStyle = workbook.createCellStyle();
            XSSFFont headerFont = ((XSSFWorkbook) workbook).createFont();
            headerFont.setFontName("Times New Roman");
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);

            // 2. TẠO DÒNG TIÊU ĐỀ
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 3. ĐỔ DỮ LIỆU
            List<ProductVariant> variants = variantRepository.findAll();
            int rowIdx = 1;

            for (ProductVariant v : variants) {
                Row row = sheet.createRow(rowIdx++);
                Product p = v.getProduct();

                // Áp dụng style cho toàn bộ các ô trong dòng để tránh lỗi font
                for (int j = 0; j < headers.length; j++) {
                    row.createCell(j).setCellStyle(bodyStyle);
                }

                // Nhóm 1: Thông tin cơ bản
                row.getCell(0).setCellValue(p.getName());
                row.getCell(1).setCellValue(p.getSlug());
                row.getCell(2).setCellValue(p.getDescription());
                row.getCell(3).setCellValue(p.getBasePrice() != null ? p.getBasePrice() : 0);
                row.getCell(4).setCellValue(p.getSalePrice() != null ? p.getSalePrice() : 0);

                // Nhóm 2: Thuộc tính sản phẩm
                row.getCell(5).setCellValue(p.getGender());
                row.getCell(6).setCellValue(p.getMaterial());
                row.getCell(7).setCellValue(p.getSoleType());
                row.getCell(8).setCellValue(p.getOrigin());
                row.getCell(9).setCellValue(p.getActive() != null ? p.getActive() : false);

                // Nhóm 3: Thông tin mở rộng
                row.getCell(10).setCellValue(p.getTotalSold() != null ? p.getTotalSold() : 0);
                row.getCell(11).setCellValue(p.getImages() != null ? String.join(",", p.getImages()) : "");

                // Nhóm 4: Phân loại
                if (p.getCategory() != null) {
                    row.getCell(12).setCellValue(p.getCategory().getName());
                    row.getCell(13).setCellValue(p.getCategory().getImage());
                }
                if (p.getBrand() != null) {
                    row.getCell(14).setCellValue(p.getBrand().getName());
                }

                // Nhóm 5: Biến thể và Quản lý
                row.getCell(15).setCellValue(v.getSize() != null ? v.getSize() : 0);
                row.getCell(16).setCellValue(v.getColor());
                row.getCell(17).setCellValue(v.getPrice() != null ? v.getPrice() : 0);
                row.getCell(18).setCellValue(v.getStock() != null ? v.getStock() : 0);
                row.getCell(19).setCellValue(v.getVersion() != null ? v.getVersion() : 0);
            }

            // Tự động căn chỉnh độ rộng cột (Auto-size)
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }


}