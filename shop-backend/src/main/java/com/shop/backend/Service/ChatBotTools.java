package com.shop.backend.Service;

import com.shop.backend.Repository.ProductVariantRepository;
import com.shop.backend.Entity.ProductVariant;
import com.shop.backend.Repository.OrderRepository;
import com.shop.backend.Repository.ProductRepository;
import com.shop.backend.Repository.UserRepository;
import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatBotTools {

    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;

    @Tool("Tìm kiếm sản phẩm thực tế theo từ khóa (tên, chất liệu, mô tả)")
    public String searchProducts(String keyword) {
        System.out.println("AI đang tìm kiếm với từ khóa: " + keyword);
        var products = productRepo.searchActiveByKeywordComprehensive(keyword);

        if (products.isEmpty())
            return "{\"status\": \"NO_MATCH\"}";

        String list = products.stream().limit(5).map(p -> {
            List<ProductVariant> variants = variantRepo.findByProductId(p.getId());
            String sizes = variants.stream().map(v -> String.valueOf(v.getSize())).distinct()
                    .collect(Collectors.joining(", "));
            String colors = variants.stream().map(ProductVariant::getColor).distinct()
                    .collect(Collectors.joining(", "));
            return """
                    {
                      "name": "%s",
                      "price": %.0f,
                      "material": "%s",
                      "soleType": "%s",
                      "availableSizes": "%s",
                      "availableColors": "%s"
                    }
                    """.formatted(p.getName(), p.getSalePrice(), p.getMaterial(), p.getSoleType(), sizes, colors);
        }).collect(Collectors.joining(","));

        return "{\"status\": \"MATCH_FOUND\", \"products\": [%s]}".formatted(list);
    }

    @Tool("Lấy chi tiết 1 sản phẩm để tư vấn sâu")
    public String getProductDetails(String productName) {
        System.out.println("--> AI đang gọi getProductDetails với tên: [" + productName + "]");

        var products = productRepo.findByNameContainingIgnoreCaseAndActiveTrue(productName);
        if (products.isEmpty())
            return "{\"status\": \"NOT_FOUND\"}";

        var p = products.get(0);
        List<ProductVariant> variants = variantRepo.findByProductId(p.getId());
        String variantsJson = variants.stream().map(v -> """
                { "color": "%s", "size": %d, "stock": %d, "price": %.0f }
                """.formatted(v.getColor(), v.getSize(), v.getStock(), v.getPrice()))
                .collect(Collectors.joining(","));

        return """
                {
                  "status": "PRODUCT_FOUND",
                  "name": "%s",
                  "price": %.0f,
                  "brand": "%s",
                  "material": "%s",
                  "soleType": "%s",
                  "description": "%s",
                  "variants": [%s]
                }
                """.formatted(p.getName(), p.getSalePrice(),
                p.getBrand() != null ? p.getBrand().getName() : "N/A",
                p.getMaterial(), p.getSoleType(),
                p.getDescription() == null ? "" : p.getDescription().replace("\"", "'").replace("\n", " "),
                variantsJson);
    }

    @Tool("Kiểm tra tồn kho chính xác của một sản phẩm theo màu sắc và kích cỡ (ví dụ: 'Giày Adidas', 'Đen', 42)")
    public String checkStock(String productName, String color, Integer size) {
        System.out.println("--> AI đang gọi checkStock | SP: [" + productName + "] | Màu: [" + color + "] | Size: [" + size + "]");

        // 1. Tìm tất cả sản phẩm chứa từ khóa
        var products = productRepo.findByNameContainingIgnoreCaseAndActiveTrue(productName);
        if (products.isEmpty())
            return "Không tìm thấy sản phẩm nào có tên tương tự trong hệ thống.";

        // 2. Duyệt qua TẤT CẢ các sản phẩm tìm được
        for (var product : products) {
            var variants = variantRepo.findByProductId(product.getId());

            // Thực hiện lọc phân loại màu và size trên từng sản phẩm
            var match = variants.stream()
                    .filter(v -> removeAccents(v.getColor()).equalsIgnoreCase(removeAccents(color)) && v.getSize().equals(size))
                    .findFirst();

            // NẾU TÌM THẤY: Trả về câu thông báo tiếng Việt đầy đủ và kết thúc hàm ngay lập tức
            if (match.isPresent()) {
                String inStockResult = "Tìm thấy sản phẩm '%s' màu '%s' size %d. Tình trạng: CÒN HÀNG. Số lượng tồn kho thực tế: %d đôi. Giá bán: %.0f VND."
                        .formatted(product.getName(), match.get().getColor(), match.get().getSize(), match.get().getStock(), match.get().getPrice());
                
                System.out.println("--> KẾT QUẢ JAVA TRẢ VỀ (THÀNH CÔNG): " + inStockResult);
                return inStockResult;
            }
            
            // TUYỆT ĐỐI KHÔNG ĐỂ BLOCK ELSE Ở ĐÂY để vòng lặp tiếp tục nhảy sang đôi tiếp theo nếu đôi này không khớp!
        }

        // 3. ĐỂ NGOÀI VÒNG LẶP: Chỉ khi đi hết tất cả sản phẩm trùng tên mà không đôi nào khớp phân loại
        String outOfStockResult = "Mẫu sản phẩm bạn tìm kiếm hiện tại HẾT HÀNG hoặc không có sẵn phân loại màu '%s' size %d này."
                .formatted(color, size);
                
        System.out.println("--> KẾT QUẢ JAVA TRẢ VỀ (THẤT BẠI): " + outOfStockResult);
        return outOfStockResult;
    }

    @Tool("Kiểm tra trạng thái đơn hàng cụ thể")
    public String getOrderStatus(String orderNumber) {
        Long currentUserId = com.shop.backend.Security.UserIdContext.getUserId();
        if (currentUserId == null)
            return "{\"status\": \"UNAUTHORIZED\", \"message\": \"You must be logged in.\"}";

        var order = orderRepo.findByOrderNumberAndUserId(orderNumber, currentUserId).orElse(null);
        if (order == null)
            return "{\"status\": \"ORDER_NOT_FOUND\", \"message\": \"Không tìm thấy đơn hàng này của bạn.\"}";

        String items = order.getItems().stream().map(item -> """
                { "productName": "%s", "size": %d, "color": "%s", "quantity": %d, "price": %.0f }
                """.formatted(item.getVariant().getProduct().getName(), item.getVariant().getSize(),
                item.getVariant().getColor(), item.getQuantity(), item.getPriceAtPurchase()))
                .collect(Collectors.joining(","));

        return """
                {
                  "status": "ORDER_FOUND",
                  "orderNumber": "%s",
                  "orderStatus": "%s",
                  "totalPrice": %.0f,
                  "items": [%s]
                }
                """.formatted(order.getOrderNumber(), order.getStatus(), order.getTotalPrice(), items);
    }

    @Tool("Lấy danh sách tối đa 5 đơn hàng gần nhất của tôi")
    public String getMyOrders() {
        Long currentUserId = com.shop.backend.Security.UserIdContext.getUserId();
        if (currentUserId == null)
            return "{\"status\": \"UNAUTHORIZED\"}";

        var orders = orderRepo.findByUserIdOrderByOrderDateDesc(currentUserId);
        if (orders.isEmpty())
            return "{\"status\": \"NO_ORDERS\"}";

        String list = orders.stream().limit(5).map(o -> """
                {
                  "orderNumber": "%s",
                  "status": "%s",
                  "totalPrice": %.0f,
                  "date": "%s"
                }
                """.formatted(o.getOrderNumber(), o.getStatus(), o.getTotalPrice(), o.getOrderDate()))
                .collect(Collectors.joining(","));

        return "{\"status\": \"SUCCESS\", \"orders\": [%s]}".formatted(list);
    }

    @Tool("Lấy thông tin cá nhân của tôi (Tên, Email, SĐT)")
    public String getUserInfo() {
        Long currentUserId = com.shop.backend.Security.UserIdContext.getUserId();
        if (currentUserId == null)
            return "{\"status\": \"UNAUTHORIZED\"}";

        var user = userRepo.findById(currentUserId).orElse(null);
        if (user == null)
            return "{\"status\": \"USER_NOT_FOUND\"}";

        return """
                {
                  "status": "SUCCESS",
                  "fullName": "%s",
                  "email": "%s",
                  "phone": "%s"
                }
                """.formatted(user.getFullName(), user.getEmail(), user.getPhone());
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String temp = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replaceAll("Đ", "D").replaceAll("đ", "d").toLowerCase().trim();
    }
}

