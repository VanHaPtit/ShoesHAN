# E-Commerce Platform (ShopHan)

Dự án Thương mại Điện tử (TMDT) cung cấp nền tảng mua sắm trực tuyến toàn diện, được xây dựng với kiến trúc hiện đại Client-Server. Hệ thống hỗ trợ đa dạng tính năng từ quản lý sản phẩm, giỏ hàng, thanh toán trực tuyến đến chăm sóc khách hàng qua hệ thống chat tích hợp và AI.

## Chức Năng Chính (Tính Năng & Vai Trò)

Dự án được chia thành hai vai trò chính: **Admin** (Quản trị viên) và **User** (Khách hàng).

### 1. Khách Hàng (User)

- **Xác thực & Bảo mật:** Đăng nhập, đăng ký, xác thực qua JWT. Khôi phục mật khẩu qua Email.
- **Mua sắm:** Tìm kiếm sản phẩm, lọc theo danh mục, thương hiệu, giá cả. Xem chi tiết sản phẩm, đánh giá và nhận xét.
- **Giỏ hàng & Thanh toán:** Thêm sản phẩm vào giỏ, cập nhật số lượng. Thanh toán trực tuyến đa dạng qua **PayPal** và **VNPay**.
- **Quản lý đơn hàng:** Theo dõi lịch sử đơn hàng, trạng thái giao hàng.
- **Chăm sóc khách hàng:** Nhắn tin trực tiếp với cửa hàng theo thời gian thực (Real-time Chat) qua WebSocket. Tích hợp **Gemini AI** hỗ trợ.

### 2. Quản Trị Viên (Admin)

- **Dashboard:** Thống kê doanh thu, đơn hàng, người dùng trực quan qua biểu đồ.
- **Quản lý Sản phẩm:** Thêm, sửa, xóa sản phẩm. Quản lý biến thể (Size, màu sắc, số lượng tồn kho), quản lý Combo sản phẩm.
- **Quản lý Đơn hàng:** Cập nhật trạng thái đơn hàng (Đang xử lý, Đã giao, Hủy).
- **Quản lý Hệ thống:** Quản lý danh mục (Category), thương hiệu (Brand), Banner quảng cáo, người dùng (User).
- **Hỗ trợ Khách hàng:** Quản lý phiên chat, trả lời tin nhắn của khách hàng.

## Công Nghệ Sử Dụng

**Backend (shop-backend)**

- **Java Spring Boot:** Khung phát triển ứng dụng chính.
- **Spring Security & JWT:** Xác thực và phân quyền người dùng.
- **Spring Data JPA & Hibernate:** ORM quản lý cơ sở dữ liệu.
- **MySQL:** Hệ quản trị cơ sở dữ liệu quan hệ.
- **WebSocket (STOMP/SockJS):** Xử lý chat thời gian thực.
- **Tích hợp bên thứ 3:**
  - **Cloudinary:** Lưu trữ hình ảnh sản phẩm.
  - **SendGrid:** Gửi email xác thực, thông báo.
  - **VNPay & PayPal:** Cổng thanh toán trực tuyến.
  - **Google Gemini AI:** Tích hợp AI thông minh.

**Frontend (FEShopShoes)**

- **ReactJS + Vite:** Xây dựng giao diện người dùng nhanh chóng.
- **TypeScript:** Đảm bảo an toàn kiểu dữ liệu.
- **Zustand:** Quản lý state gọn nhẹ.
- **Recharts:** Vẽ biểu đồ thống kê cho Admin.
- **Lucide React:** Icon sắc nét.

## 🗄 Cấu Trúc Database & Quan Hệ Các Bảng (ERD)

Cơ sở dữ liệu được thiết kế chặt chẽ, tối ưu cho nghiệp vụ Thương mại điện tử với các nhóm thực thể chính và mối quan hệ như sau:

### 1. Nhóm Quản lý Người dùng & Phân quyền
- **`users`**: Lưu trữ thông tin tài khoản (email, password, tên, số điện thoại, ngày sinh, trạng thái hoạt động).
  - Quan hệ **1-1** với bảng `addresses` (Mỗi user có 1 địa chỉ giao hàng mặc định).
  - Quan hệ **N-N** với bảng `roles` thông qua bảng trung gian `user_roles` (Mỗi user có thể có nhiều quyền, ví dụ: Admin, User).
- **`roles`**: Định nghĩa các quyền hạn trong hệ thống (ROLE_ADMIN, ROLE_USER).
- **`addresses`**: Lưu chi tiết địa chỉ (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố).

### 2. Nhóm Quản lý Sản phẩm (Catalog)
- **`products`**: Lưu thông tin chung của sản phẩm (Tên, mô tả, giá gốc, giá khuyến mãi, số lượng đã bán, giới tính, chất liệu, xuất xứ...).
  - Quan hệ **N-1** với `categories` (Mỗi sản phẩm thuộc 1 danh mục).
  - Quan hệ **N-1** với `brands` (Mỗi sản phẩm thuộc 1 thương hiệu).
  - Quan hệ **1-N** với `product_variants` (Một sản phẩm có nhiều biến thể).
  - Quan hệ **1-N** với `reviews` (Một sản phẩm có nhiều đánh giá).
- **`product_variants`**: Lưu chi tiết từng phiên bản của sản phẩm theo Size và Màu sắc. Chứa thông tin quan trọng về `stock` (Số lượng tồn kho) và `price` (Giá riêng cho từng biến thể).
- **`categories`**: Danh mục sản phẩm (Ví dụ: Giày chạy bộ, Giày thời trang).
- **`brands`**: Thương hiệu sản phẩm (Ví dụ: Nike, Adidas).

### 3. Nhóm Quản lý Giỏ hàng (Cart)
- **`carts`**: Lưu trữ giỏ hàng hiện tại của người dùng. Mỗi `User` chỉ có **1** `Cart` (Quan hệ 1-1). Chứa tổng tiền (`totalBill`).
- **`cart_items`**: Chi tiết các sản phẩm trong giỏ hàng.
  - Quan hệ **N-1** với `carts`.
  - Quan hệ **N-1** với `product_variants` (Người dùng chọn thêm biến thể cụ thể nào vào giỏ với số lượng bao nhiêu).

### 4. Nhóm Quản lý Đơn hàng & Thanh toán (Order)
- **`orders`**: Lưu trữ thông tin đơn hàng đã đặt (Mã đơn, tổng tiền, trạng thái đơn hàng, tên người nhận, SĐT, địa chỉ giao hàng, ngày đặt).
  - Quan hệ **N-1** với `users` (Một người dùng có thể đặt nhiều đơn).
  - Quan hệ **1-1** với `payments` (Mỗi đơn hàng có 1 hóa đơn thanh toán tương ứng).
  - Quan hệ **1-N** với `order_items` (Chi tiết đơn).
- **`order_items`**: Chi tiết từng sản phẩm trong đơn hàng (Giá tại thời điểm mua, số lượng mua).
  - Quan hệ **N-1** với `orders`.
  - Quan hệ **N-1** với `product_variants` (Sản phẩm cụ thể được mua).
- **`payments`**: Lưu trữ trạng thái thanh toán (Thành công, Thất bại, Chờ xử lý) và phương thức thanh toán (Tiền mặt, VNPay, PayPal).

### 5. Nhóm Tương tác Khách hàng (Chat & Review)
- **`reviews`**: Nhận xét và đánh giá (rating 1-5 sao) của khách hàng.
  - Quan hệ **N-1** với `users` (Người đánh giá).
  - Quan hệ **N-1** với `products` (Sản phẩm được đánh giá).
- **`chat_sessions`**: Phiên bản chat giữa hệ thống/Admin và User. (Quan hệ **N-1** với `users`).
- **`chat_messages`**: Chi tiết các dòng tin nhắn trong phiên chat. (Quan hệ **N-1** với `chat_sessions`).

### 6. Các bảng hệ thống khác
- **`banners`**: Quản lý hình ảnh banner hiển thị trên trang chủ.
- **`shop_config`**: Cấu hình chung của cửa hàng (tên shop, logo, thông tin liên hệ).
- **`combos`**: Quản lý các combo khuyến mãi gộp nhiều sản phẩm.

---

## Hình Ảnh Demo

### 1. Giao Diện Người Dùng (Khách Hàng)

![Giao diện trang chủ](./images/Giao%20di%E1%BB%87n%20trang%20ch%E1%BB%A7.png)
![Giao diện chi tiết sản phẩm](./images/Giao%20di%E1%BB%87n%20chi%20ti%E1%BA%BFt%20s%E1%BA%A3n%20ph%E1%BA%A9m.png)
![Giao diện chi tiết sản phẩm 2](./images/Giao%20di%E1%BB%87n%20chi%20ti%E1%BA%BFt%20s%E1%BA%A3n%20ph%E1%BA%A9m%202.png)
![Giao diện tìm kiếm sản phẩm](./images/Giao%20di%E1%BB%87n%20t%C3%ACm%20ki%E1%BA%BFm%20s%E1%BA%A3n%20ph%E1%BA%A9m.png)
![Giao diện giỏ hàng](./images/Giao%20di%E1%BB%87n%20gi%E1%BB%8F%20h%C3%A0ng.png)
![Giao diện thanh toán](./images/Giao%20di%E1%BB%87n%20thanh%20to%C3%A1n.png)
![Giao diện đơn hàng](./images/Giao%20di%E1%BB%87n%20%C4%91%C6%A1n%20h%C3%A0ng.png)
![Giao diện đánh giá sản phẩm](./images/Giao%20di%E1%BB%87n%20%C4%91%C3%A1nh%20gi%C3%A1%20s%E1%BA%A3n%20ph%E1%BA%A9m.png)
![Giao diện hồ sơ cá nhân](./images/Giao%20di%E1%BB%87n%20h%E1%BB%93%20s%C6%A1%20c%C3%A1%20nh%C3%A2n.png)
![Giao diện chat với khách hàng](./images/Giao%20di%E1%BB%87n%20chat%20v%E1%BB%9Bi%20kh%C3%A1ch%20h%C3%A0ng.png)

### 2. Giao Diện Xác Thực

![Giao diện login](./images/Giao%20di%E1%BB%87n%20login.png)
![Giao diện tạo mới tài khoản](./images/Giao%20di%E1%BB%87n%20t%E1%BA%A1o%20m%E1%BB%9Bi%20t%C3%A0i%20kho%E1%BA%A3n.png)

### 3. Giao Diện Quản Trị Viên (Admin)

![Giao diện quản trị của admin](./images/Giao%20di%C3%AAn%20qu%E1%BA%A3n%20tr%E1%BB%8B%20c%E1%BB%A7a%20admin.png)
![Giao diện quản lí sản phẩm](./images/Giao%20di%E1%BB%87n%20qu%E1%BA%A3n%20l%C3%AD%20s%E1%BA%A3n%20ph%E1%BA%A9m.png)
![Giao diện thêm mới sản phẩm](./images/Giao%20di%E1%BB%87n%20th%C3%AAm%20m%E1%BB%9Bi%20s%E1%BA%A3n%20ph%E1%BA%A9m.png)
![Giao diện quản lí đơn hàng](./images/Giao%20di%E1%BB%87n%20qu%E1%BA%A3n%20l%C3%AD%20%C4%91%C6%A1n%20h%C3%A0ng.png)

## Cài Đặt và Chạy Dự Án

### Backend

1. Cấu hình cơ sở dữ liệu MySQL và các thông tin API keys (Cloudinary, SendGrid, PayPal, VNPay, Gemini) trong file `shop-backend/local.env`.
2. Mở project `shop-backend` bằng IDE (IntelliJ/Eclipse).
3. Chạy file `ShopBackendApplication.java`.

### Frontend

1. Cài đặt Node.js.
2. Di chuyển vào thư mục `FEShopShoes`.
3. Chạy lệnh: `npm install`
4. Chạy lệnh: `npm run dev`
