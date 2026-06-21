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

## Cấu Trúc Database & Quan Hệ Các Bảng (ERD)

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

---

## API Specification

### ĐẶC TẢ CHI TIẾT API: MODULE QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN

#### 1. API ĐĂNG KÝ TÀI KHOẢN (REGISTER)

**Tên API:** Đăng ký tài khoản khách hàng mới
**1. Mô tả tổng quan:** API cho phép người dùng (User) tạo mới một tài khoản trong hệ thống. Hệ thống sẽ lưu thông tin cơ bản vào bảng `users` và gán mặc định quyền `ROLE_USER` thông qua bảng `roles`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/auth/register`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu   | Bắt buộc | Mô tả                                                          |
| :------------ | :---------------- | :--------- | :--------------------------------------------------------------- |
| email         | String            | Có        | Địa chỉ email của người dùng (dùng để đăng nhập).   |
| password      | String            | Có        | Mật khẩu (sẽ được mã hóa bằng bcrypt trước khi lưu). |
| fullName      | String            | Có        | Tên đầy đủ của người dùng.                              |
| phoneNumber   | String            | Không     | Số điện thoại liên hệ.                                     |
| dateOfBirth   | Date (YYYY-MM-DD) | Không     | Ngày sinh của người dùng.                                   |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 201):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)                   |
| :-------------------- | :--------------------- | :------------------------------------------------ |
| status                | Number                 | Mã trạng thái hệ thống (VD: 201).            |
| message               | String                 | Thông báo trả về ("Đăng ký thành công"). |

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 201,
  "message": "Đăng ký tài khoản thành công."
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `400 Bad Request`: Dữ liệu đầu vào không hợp lệ (VD: sai định dạng email, mật khẩu quá ngắn).
* `409 Conflict`: Email đã tồn tại trong hệ thống.

---

#### 2. API ĐĂNG NHẬP & XÁC THỰC (LOGIN)

**Tên API:** Đăng nhập và nhận Token xác thực
**1. Mô tả tổng quan:** API kiểm tra thông tin đăng nhập và trả về một chuỗi JWT (JSON Web Token) thông qua Spring Security để client sử dụng cho các request yêu cầu bảo mật sau này.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/auth/login`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                           |
| :------------ | :-------------- | :--------- | :-------------------------------- |
| email         | String          | Có        | Địa chỉ email đã đăng ký. |
| password      | String          | Có        | Mật khẩu đăng nhập.          |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 200):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)           |
| :-------------------- | :--------------------- | :---------------------------------------- |
| status                | Number                 | Mã trạng thái hệ thống.              |
| message               | String                 | Thông báo trả về.                     |
| payload               | Object                 | Chứa thông tin token và người dùng. |
| payload.accessToken   | String                 | Chuỗi JWT dùng để xác thực.         |
| payload.tokenType     | String                 | Kiểu token (Bearer).                     |

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "payload": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "tokenType": "Bearer"
  }
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `401 Unauthorized`: Sai email hoặc mật khẩu.
* `403 Forbidden`: Tài khoản đã bị khóa (trạng thái hoạt động = false).

---

#### 3. API KHÔI PHỤC MẬT KHẨU (FORGOT PASSWORD)

**Tên API:** Yêu cầu khôi phục mật khẩu qua Email
**1. Mô tả tổng quan:** API nhận yêu cầu khôi phục mật khẩu và kích hoạt dịch vụ SendGrid để gửi một email chứa mã OTP hoặc đường link đặt lại mật khẩu cho khách hàng.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/auth/forgot-password`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                             |
| :------------ | :-------------- | :--------- | :-------------------------------------------------- |
| email         | String          | Có        | Email của tài khoản cần khôi phục mật khẩu. |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 200):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)                         |
| :-------------------- | :--------------------- | :------------------------------------------------------ |
| status                | Number                 | Mã trạng thái hệ thống.                            |
| message               | String                 | Thông báo hướng dẫn người dùng kiểm tra email. |

**5. Các mã lỗi thường gặp (Error Codes):**

* `404 Not Found`: Email không tồn tại trong hệ thống.
* `500 Internal Server Error`: Lỗi kết nối với dịch vụ gửi mail (SendGrid).

---

#### 4. API QUẢN LÝ HỒ SƠ & ĐỊA CHỈ (UPDATE PROFILE)

**Tên API:** Cập nhật thông tin cá nhân và cấu hình địa chỉ giao hàng
**1. Mô tả tổng quan:** API cho phép User cập nhật thông tin cá nhân (`users`) và thiết lập 1 địa chỉ giao hàng mặc định (bảng `addresses` - quan hệ 1-1 với user).
**2. Thông tin kết nối:**

* **Method (Phương thức):** PUT
* **Endpoint (Đường dẫn):** `/api/v1/users/profile`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>`
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường       | Kiểu dữ liệu | Bắt buộc | Mô tả                                      |
| :------------------ | :-------------- | :--------- | :------------------------------------------- |
| fullName            | String          | Có        | Tên đầy đủ cập nhật.                  |
| phoneNumber         | String          | Có        | Số điện thoại cập nhật.                |
| address             | Object          | Không     | Khối dữ liệu chứa địa chỉ giao hàng. |
| address.houseNumber | String          | Không     | Số nhà / Tên tòa nhà.                   |
| address.street      | String          | Không     | Tên đường.                               |
| address.ward        | String          | Không     | Phường / Xã.                              |
| address.district    | String          | Không     | Quận / Huyện.                              |
| address.city        | String          | Không     | Tỉnh / Thành phố.                         |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 200):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)      |
| :-------------------- | :--------------------- | :----------------------------------- |
| status                | Number                 | Mã trạng thái hệ thống.         |
| message               | String                 | Thông báo cập nhật thành công. |

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Cập nhật hồ sơ thành công."
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `401 Unauthorized`: Token không hợp lệ, hết hạn hoặc bị thiếu.
* `400 Bad Request`: Thiếu các trường thông tin bắt buộc trong payload.

---

### ĐẶC TẢ CHI TIẾT API: MODULE QUẢN LÝ SẢN PHẨM & DANH MỤC

#### 1. API THÊM MỚI SẢN PHẨM & BIẾN THỂ (CREATE PRODUCT)

**Tên API:** Thêm mới sản phẩm và cấu hình biến thể (Dành cho Admin)
**1. Mô tả tổng quan:** API cho phép Quản trị viên (Admin) tạo mới một sản phẩm gốc (lưu vào bảng `products`) kèm theo danh sách các biến thể của nó (lưu vào bảng `product_variants`). API cũng thực hiện liên kết sản phẩm này với Danh mục (`categories`) và Thương hiệu (`brands`) tương ứng.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/admin/products`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>` (Yêu cầu quyền `ROLE_ADMIN`)
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường  | Kiểu dữ liệu | Bắt buộc | Mô tả                                     |
| :------------- | :-------------- | :--------- | :------------------------------------------ |
| name           | String          | Có        | Tên sản phẩm.                            |
| description    | String          | Có        | Mô tả chi tiết sản phẩm.               |
| originalPrice  | Number          | Có        | Giá gốc của sản phẩm.                  |
| discountPrice  | Number          | Không     | Giá khuyến mãi (nếu có).               |
| gender         | String          | Có        | Giới tính (Nam, Nữ, Unisex).             |
| material       | String          | Có        | Chất liệu (VD: Da, Vải Mesh).            |
| origin         | String          | Có        | Xuất xứ (VD: Việt Nam, USA).             |
| categoryId     | Number          | Có        | ID của danh mục sản phẩm.               |
| brandId        | Number          | Có        | ID của thương hiệu.                     |
| variants       | Array[Object]   | Có        | Danh sách các biến thể của sản phẩm. |
| variants.size  | String          | Có        | Kích cỡ (VD: 39, 40, 41).                 |
| variants.color | String          | Có        | Màu sắc (VD: Đen, Trắng).               |
| variants.price | Number          | Có        | Giá bán lẻ riêng cho biến thể này.   |
| variants.stock | Number          | Có        | Số lượng tồn kho của biến thể này.  |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 201):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)                        |
| :-------------------- | :--------------------- | :----------------------------------------------------- |
| status                | Number                 | Mã trạng thái hệ thống (201).                     |
| message               | String                 | Thông báo trả về ("Tạo sản phẩm thành công"). |
| payload.productId     | Number                 | ID của sản phẩm vừa tạo.                          |

**5. Các mã lỗi thường gặp (Error Codes):**

* `400 Bad Request`: Thiếu thông tin bắt buộc hoặc sai định dạng dữ liệu.
* `403 Forbidden`: Token không hợp lệ hoặc không có quyền Admin.
* `404 Not Found`: Không tìm thấy categoryId hoặc brandId trong hệ thống.

---

#### 2. API TÌM KIẾM VÀ LỌC SẢN PHẨM (SEARCH & FILTER PRODUCTS)

**Tên API:** Lấy danh sách sản phẩm hiển thị cho Khách hàng
**1. Mô tả tổng quan:** API cho phép User tìm kiếm thông minh và lọc danh sách sản phẩm theo nhiều tiêu chí đa chiều (danh mục, thương hiệu, khoảng giá). API hỗ trợ phân trang (Pagination) để tối ưu hiệu suất.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/products`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Content-Type: application/json
* **Query Parameters (Tham số trên URL):**

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                                              |
| :--------- | :-------------- | :--------- | :--------------------------------------------------- |
| keyword    | String          | Không     | Từ khóa tìm kiếm theo tên sản phẩm.           |
| categoryId | Number          | Không     | Lọc theo ID danh mục.                              |
| brandId    | Number          | Không     | Lọc theo ID thương hiệu.                         |
| minPrice   | Number          | Không     | Lọc giá trị đơn hàng tối thiểu.              |
| maxPrice   | Number          | Không     | Lọc giá trị đơn hàng tối đa.                 |
| page       | Number          | Không     | Trang hiện tại (Mặc định: 0).                   |
| size       | Number          | Không     | Số lượng hiển thị mỗi trang (Mặc định: 10). |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Lấy danh sách thành công",
  "payload": {
    "content": [
      {
        "id": 1,
        "name": "Giày chạy bộ Nike Air Zoom",
        "discountPrice": 2500000,
        "brand": "Nike",
        "category": "Giày chạy bộ"
      }
    ],
    "totalPages": 5,
    "totalElements": 45
  }
}
```

---

#### 3. API XEM CHI TIẾT SẢN PHẨM (GET PRODUCT DETAIL)

**Tên API:** Lấy thông tin chi tiết một sản phẩm và các biến thể
**1. Mô tả tổng quan:** Trả về toàn bộ thông tin chi tiết của một sản phẩm dựa vào ID, bao gồm danh sách các tùy chọn Kích cỡ, Màu sắc, Giá và Tồn kho tương ứng (`product_variants`) để người dùng tiến hành chọn mua.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/products/{id}`
  **3. Yêu cầu gửi đi (Request):**
* **Path Variable:** `id` (Number) - ID của sản phẩm cần xem.
  **4. Kết quả trả về (Response):**
* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Thành công",
  "payload": {
    "id": 1,
    "name": "Giày chạy bộ Nike Air Zoom",
    "description": "Giày chạy bộ siêu nhẹ...",
    "material": "Vải Mesh",
    "variants": [
      {
        "id": 101,
        "size": "40",
        "color": "Đỏ",
        "price": 2500000,
        "stock": 15
      },
      {
        "id": 102,
        "size": "41",
        "color": "Trắng",
        "price": 2600000,
        "stock": 0
      }
    ]
  }
}
```

---

#### 4. API TẠO GÓI KHUYẾN MÃI (CREATE COMBO)

**Tên API:** Nhóm sản phẩm thành gói khuyến mãi (Dành cho Admin)
**1. Mô tả tổng quan:** API cho phép Admin tạo một Combo bao gồm nhiều sản phẩm khác nhau nhằm mục đích kích cầu mua sắm. Dữ liệu được lưu vào bảng `combos`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/admin/combos`
  **3. Yêu cầu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                     |
| :------------ | :-------------- | :--------- | :------------------------------------------ |
| comboName     | String          | Có        | Tên gói combo khuyến mãi.               |
| description   | String          | Không     | Mô tả lợi ích khi mua combo.            |
| comboPrice    | Number          | Có        | Giá bán tổng của gói combo.            |
| productIds    | Array[Number]   | Có        | Danh sách ID các sản phẩm thuộc combo. |

**4. Các mã lỗi thường gặp:**

* `404 Not Found`: Một hoặc nhiều `productId` truyền vào không tồn tại.

---

### ĐẶC TẢ CHI TIẾT API: MODULE QUẢN LÝ GIỎ HÀNG

#### 1. API LẤY THÔNG TIN GIỎ HÀNG (GET CART)

**Tên API:** Lấy thông tin chi tiết giỏ hàng hiện tại của người dùng.
**1. Mô tả tổng quan:** API trả về toàn bộ thông tin giỏ hàng của User đang đăng nhập, bao gồm tổng tiền (`totalBill`) và danh sách các sản phẩm (bao gồm Size, Màu sắc, số lượng) đang có trong giỏ.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/cart`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>`
  * Content-Type: application/json
    **4. Kết quả trả về (Response):**
* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 200):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)                        |
| :-------------------- | :--------------------- | :----------------------------------------------------- |
| status                | Number                 | Mã trạng thái hệ thống (200).                     |
| message               | String                 | Thông báo trả về.                                  |
| payload               | Object                 | Chứa thông tin giỏ hàng của user.                 |
| payload.cartId        | Number                 | ID của giỏ hàng (`carts`).                        |
| payload.totalBill     | Number                 | Tổng tiền hiện tại của giỏ hàng.                |
| payload.items         | Array[Object]          | Danh sách chi tiết các món hàng (`cart_items`). |

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Lấy thông tin giỏ hàng thành công",
  "payload": {
    "cartId": 15,
    "totalBill": 5000000,
    "items": [
      {
        "itemId": 101,
        "variantId": 25,
        "productName": "Giày chạy bộ Nike Air Zoom",
        "size": "40",
        "color": "Đỏ",
        "price": 2500000,
        "quantity": 2
      }
    ]
  }
}
```

---

#### 2. API THÊM BIẾN THỂ SẢN PHẨM VÀO GIỎ (ADD TO CART)

**Tên API:** Thêm biến thể sản phẩm (Size, Màu) vào giỏ hàng.
**1. Mô tả tổng quan:** API cho phép User chọn một biến thể cụ thể (`product_variants`) với số lượng mong muốn và đưa vào giỏ hàng (`cart_items`). Hệ thống sẽ tự động tính toán lại `totalBill`. Nếu biến thể đã tồn tại trong giỏ, hệ thống sẽ cộng dồn số lượng.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/cart/items`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>`
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                                         |
| :------------ | :-------------- | :--------- | :-------------------------------------------------------------- |
| variantId     | Number          | Có        | ID của biến thể sản phẩm cụ thể (đã chọn Size, Màu). |
| quantity      | Number          | Có        | Số lượng muốn thêm vào giỏ.                              |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Thêm sản phẩm vào giỏ hàng thành công.",
  "payload": {
    "totalBill": 5000000
  }
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `400 Bad Request`: Số lượng yêu cầu vượt quá số lượng tồn kho (stock) hiện có của biến thể.
* `404 Not Found`: Không tìm thấy variantId trong hệ thống.

---

#### 3. API ĐIỀU CHỈNH SỐ LƯỢNG MUA (UPDATE CART ITEM QUANTITY)

**Tên API:** Cập nhật số lượng của một sản phẩm đã có trong giỏ.
**1. Mô tả tổng quan:** Khách hàng sử dụng API này khi thao tác tăng/giảm số lượng của một mặt hàng ngay tại giao diện Giỏ hàng. Hệ thống sẽ cập nhật bảng `cart_items` và tính lại `totalBill` ở bảng `carts`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** PUT
* **Endpoint (Đường dẫn):** `/api/v1/cart/items/{itemId}`
  **3. Yêu cầu gửi đi (Request):**
* **Path Variable:** `itemId` (Number) - ID của bản ghi trong bảng `cart_items`.
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                 |
| :------------ | :-------------- | :--------- | :-------------------------------------- |
| quantity      | Number          | Có        | Số lượng mới mong muốn cập nhật. |

**4. Các mã lỗi thường gặp:**

* `400 Bad Request`: Số lượng cập nhật quantity <= 0 hoặc vượt quá stock.

---

#### 4. API XÓA SẢN PHẨM KHỎI GIỎ HÀNG (REMOVE FROM CART)

**Tên API:** Xóa một mặt hàng khỏi giỏ hàng.
**1. Mô tả tổng quan:** Cho phép User loại bỏ hoàn toàn một mặt hàng (`cart_items`) ra khỏi giỏ hàng hiện tại. Hệ thống tiến hành trừ đi giá trị của mặt hàng này khỏi `totalBill`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** DELETE
* **Endpoint (Đường dẫn):** `/api/v1/cart/items/{itemId}`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Path Variable:** `itemId` (Number) - ID của item cần xóa.
  **4. Kết quả trả về (Response):**
* Trả về Status 200 kèm message "Đã xóa sản phẩm khỏi giỏ hàng".

---

### ĐẶC TẢ CHI TIẾT API: MODULE ĐƠN HÀNG & THANH TOÁN

#### 1. API ĐẶT HÀNG (CHECKOUT / CREATE ORDER)

**Tên API:** Khởi tạo đơn hàng mới từ Giỏ hàng.
**1. Mô tả tổng quan:** API này được gọi khi khách hàng (User) tiến hành đặt hàng. Hệ thống sẽ lấy thông tin từ Giỏ hàng, tạo mới một bản ghi tại bảng `orders` (thông tin người nhận, địa chỉ, tổng tiền). Chi tiết các món hàng sẽ được "chốt giá" tại thời điểm mua và lưu vào `order_items`. Đồng thời, một bản ghi tương ứng sẽ được sinh ra ở bảng `payments` với trạng thái mặc định là "Chờ xử lý".
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/orders`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>`
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường   | Kiểu dữ liệu | Bắt buộc | Mô tả                                                                      |
| :-------------- | :-------------- | :--------- | :--------------------------------------------------------------------------- |
| receiverName    | String          | Có        | Tên người nhận hàng.                                                    |
| receiverPhone   | String          | Có        | Số điện thoại người nhận.                                             |
| shippingAddress | String          | Có        | Địa chỉ giao hàng chi tiết.                                             |
| paymentMethod   | String          | Có        | Phương thức thanh toán lựa chọn:`CASH`, `VNPAY`, hoặc `PAYPAL`. |

**4. Kết quả trả về (Response):**

* **Cấu trúc Dữ liệu trả về khi thành công (HTTP Status 201):**

| Tên trường (Field) | Kiểu dữ liệu (Type) | Mô tả chi tiết (Description)                                                                                             |
| :-------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| status                | Number                 | Mã trạng thái hệ thống (201).                                                                                          |
| message               | String                 | Thông báo tạo đơn hàng thành công.                                                                                  |
| payload.orderId       | Number                 | Mã định danh của đơn hàng (`orders.id`).                                                                           |
| payload.paymentUrl    | String                 | Đường dẫn chuyển hướng đến cổng thanh toán (Nếu phương thức là VNPay/PayPal). Trống nếu chọn Tiền mặt. |

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 201,
  "message": "Tạo đơn hàng thành công.",
  "payload": {
    "orderId": 505,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `400 Bad Request`: Giỏ hàng đang trống, hoặc phương thức thanh toán không hợp lệ.
* `409 Conflict`: Số lượng tồn kho (stock) của một biến thể trong giỏ không đủ để đặt hàng.

---

#### 2. API CẬP NHẬT TRẠNG THÁI THANH TOÁN (PAYMENT CALLBACK)

**Tên API:** Xử lý kết quả trả về từ cổng thanh toán bên thứ 3.
**1. Mô tả tổng quan:** API Webhook/Callback được các cổng thanh toán (VNPay, PayPal) gọi về hệ thống sau khi khách hàng thực hiện giao dịch. API sẽ cập nhật trạng thái của bảng `payments` sang "Thành công" hoặc "Thất bại".
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET / POST (Phụ thuộc Webhook của Gateway)
* **Endpoint (Đường dẫn):** `/api/v1/payments/callback`
  **3. Yêu cầu gửi đi (Request):**
* Hệ thống nhận các tham số mã hóa do VNPay/PayPal gửi về trên URL (Query Params).
  **4. Kết quả trả về (Response):**
* Hệ thống xử lý chữ ký điện tử (Signature/Checksum) thành công, cập nhật CSDL và HTTP 200, redirect người dùng về trang "Thanh toán thành công/thất bại" trên Frontend.
  **5. Các mã lỗi thường gặp:**
* `400 Bad Request`: Chữ ký giao dịch không hợp lệ (nguy cơ giả mạo giao dịch).

---

#### 3. API THEO DÕI LỊCH SỬ ĐƠN HÀNG (GET USER ORDERS)

**Tên API:** Lấy danh sách và trạng thái đơn hàng của Khách hàng.
**1. Mô tả tổng quan:** API cho phép User theo dõi lịch sử các đơn hàng đã đặt và trạng thái giao hàng hiện tại. Dữ liệu được trích xuất từ bảng `orders` có quan hệ N-1 với tài khoản đang đăng nhập.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/orders/history`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                            |
| :------- | :-------------- | :--------- | :--------------------------------- |
| page     | Number          | Không     | Phân trang (Mặc định 0).       |
| size     | Number          | Không     | Số lượng hiển thị mỗi trang. |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Lấy lịch sử đơn hàng thành công",
  "payload": {
    "content": [
      {
        "orderId": 505,
        "orderDate": "2026-06-21T10:30:00",
        "totalAmount": 5000000,
        "orderStatus": "Đang xử lý",
        "payment": {
          "method": "VNPAY",
          "status": "Thành công"
        }
      }
    ]
  }
}
```

---

#### 4. API CẬP NHẬT TRẠNG THÁI LUÂN CHUYỂN ĐƠN HÀNG (UPDATE ORDER STATUS)

**Tên API:** Cập nhật trạng thái giao hàng (Dành cho Admin).
**1. Mô tả tổng quan:** API cho phép Quản trị viên (Admin) cập nhật tiến độ của đơn hàng theo thực tế vận hành (Ví dụ: Chuyển từ "Đang xử lý" sang "Đã giao" hoặc "Đã hủy").
**2. Thông tin kết nối:**

* **Method (Phương thức):** PATCH
* **Endpoint (Đường dẫn):** `/api/v1/admin/orders/{orderId}/status`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>` (Yêu cầu `ROLE_ADMIN`)
  * Content-Type: application/json
* **Path Variable:** `orderId` (Number) - Mã ID của đơn hàng.
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                                  |
| :------------ | :-------------- | :--------- | :------------------------------------------------------- |
| status        | String          | Có        | Trạng thái mới ("PENDING", "DELIVERED", "CANCELLED"). |

**4. Kết quả trả về (Response):**

* Trả về Status 200 với thông báo "Cập nhật trạng thái đơn hàng thành công."
  **5. Các mã lỗi thường gặp (Error Codes):**
* `404 Not Found`: Không tìm thấy orderId trong hệ thống.
* `403 Forbidden`: Người dùng thao tác không phải là Admin.

---

### ĐẶC TẢ CHI TIẾT API: MODULE CHĂM SÓC & TƯƠNG TÁC KHÁCH HÀNG

#### 1. API GỬI ĐÁNH GIÁ SẢN PHẨM (CREATE REVIEW)

**Tên API:** Khách hàng đánh giá và chấm điểm sản phẩm.
**1. Mô tả tổng quan:** API cho phép User (đã mua hàng) để lại nhận xét và chấm điểm Rating (1-5 sao) cho một sản phẩm cụ thể. Dữ liệu được lưu vào bảng `reviews` có quan hệ N-1 với `users` và `products`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/reviews`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>`
  * Content-Type: application/json
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                           |
| :------------ | :-------------- | :--------- | :------------------------------------------------ |
| productId     | Number          | Có        | ID của sản phẩm cần đánh giá.              |
| rating        | Number          | Có        | Điểm số đánh giá (Từ 1 đến 5 sao).       |
| comment       | String          | Không     | Nội dung nhận xét chi tiết của khách hàng. |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON) (HTTP Status 201):**

```json
{
  "status": 201,
  "message": "Cảm ơn bạn đã đánh giá sản phẩm.",
  "payload": {
    "reviewId": 105,
    "rating": 5,
    "comment": "Giày đi rất êm và đúng size!"
  }
}
```

**5. Các mã lỗi thường gặp (Error Codes):**

* `403 Forbidden`: Người dùng chưa từng mua sản phẩm này hoặc đơn hàng chưa ở trạng thái "Đã giao".
* `400 Bad Request`: Mức `rating` nằm ngoài khoảng 1-5.

---

#### 2. API LẤY LỊCH SỬ TIN NHẮN PHIÊN CHAT (GET CHAT HISTORY)

**Tên API:** Tải lại lịch sử tin nhắn của một phiên chat.
**1. Mô tả tổng quan:** Lấy toàn bộ chi tiết các dòng tin nhắn (`chat_messages`) thuộc một phiên bản chat (`chat_sessions`) cụ thể giữa hệ thống/Admin và User.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/chat/sessions/{sessionId}/messages`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Path Variable:** `sessionId` (Number) - ID của phiên chat cần xem.
  **4. Kết quả trả về (Response):**
* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Thành công",
  "payload": [
    {
      "messageId": 1,
      "senderType": "USER",
      "content": "Shop cho hỏi mẫu này còn size 40 không?",
      "timestamp": "2026-06-21T14:00:00"
    },
    {
      "messageId": 2,
      "senderType": "AI",
      "content": "Dạ mẫu giày này hiện tại vẫn còn size 40 ạ. Bạn có thể tiến hành thêm vào giỏ hàng nhé!",
      "timestamp": "2026-06-21T14:00:05"
    }
  ]
}
```

---

#### 3. ĐẶC TẢ KẾT NỐI WEBSOCKET: LIVE CHAT & TÍCH HỢP GEMINI AI

**Tên Event:** Hệ thống nhắn tin theo thời gian thực.
**1. Mô tả tổng quan:** Vì nghiệp vụ là nhắn tin thời gian thực (Real-time Chat), hệ thống sử dụng WebSocket (giao thức STOMP/SockJS).
**Luồng hoạt động:**

* Khách hàng gửi tin nhắn lên kênh hệ thống.
* Nếu Admin đang online và tham gia phiên chat, Admin sẽ chat trực tiếp với User.
* Nếu Admin không online/chưa phản hồi, luồng tin nhắn sẽ được đẩy qua API của Google Gemini AI để phân tích từ khóa và tự động sinh câu trả lời giải đáp ngay lập tức cho User.
  **2. Thông tin kết nối WebSocket (Dành cho Frontend):**
* **Endpoint kết nối:** `/ws-chat`
* **Kênh Đăng ký nhận tin nhắn (Subscribe):** `/topic/chat/{sessionId}`
* **Kênh Gửi tin nhắn đi (Send/Publish):** `/app/chat.send`
  **3. Cấu trúc gói tin gửi đi (Payload):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                  |
| :------------ | :-------------- | :--------- | :--------------------------------------- |
| sessionId     | Number          | Có        | ID của phiên chat hiện tại.          |
| senderId      | Number          | Có        | ID của người gửi (User hoặc Admin). |
| content       | String          | Có        | Nội dung đoạn chat.                   |

**4. Kịch bản phản hồi từ Google Gemini AI:**
Khi Backend (Java Spring Boot) nhận được tin nhắn từ User qua WebSocket, hệ thống gọi service gửi prompt (kèm theo context về kho hàng, chính sách đổi trả) sang Google Gemini AI. Câu trả lời từ AI sẽ được Backend format lại thành một message gửi ngược vào kênh `/topic/chat/{sessionId}` với `senderType = "AI"`. Toàn bộ lịch sử này sẽ được lưu xuống CSDL (`chat_messages`).

---

### ĐẶC TẢ CHI TIẾT API: MODULE QUẢN TRỊ HỆ THỐNG & BÁO CÁO

#### 1. API LẤY SỐ LIỆU THỐNG KÊ DASHBOARD (GET DASHBOARD METRICS)

**Tên API:** Lấy số liệu thống kê tổng quan cho Dashboard
**1. Mô tả tổng quan:** API trả về các số liệu quan trọng bao gồm: Tổng doanh thu, tổng số đơn hàng, và tổng lượng người dùng mới trong một khoảng thời gian nhất định. Dữ liệu này được thiết kế tối ưu để Frontend sử dụng thư viện Recharts vẽ các biểu đồ trực quan (như biểu đồ đường, biểu đồ cột).
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/admin/dashboard/statistics`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:**
  * Authorization: Bearer `<token>` (Yêu cầu quyền `ROLE_ADMIN`)
* **Query Parameters:**

| Tham số  | Kiểu dữ liệu   | Bắt buộc | Mô tả                                                                |
| :-------- | :---------------- | :--------- | :--------------------------------------------------------------------- |
| startDate | Date (YYYY-MM-DD) | Không     | Ngày bắt đầu thống kê (Mặc định là đầu tháng hiện tại). |
| endDate   | Date (YYYY-MM-DD) | Không     | Ngày kết thúc thống kê (Mặc định là ngày hiện tại).        |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON) (HTTP Status 200):**

```json
{
  "status": 200,
  "message": "Lấy dữ liệu thống kê thành công",
  "payload": {
    "totalRevenue": 150000000,
    "totalOrders": 320,
    "totalNewUsers": 45,
    "chartData": [
      {
        "date": "2026-06-15",
        "revenue": 10000000,
        "orders": 20
      },
      {
        "date": "2026-06-16",
        "revenue": 15000000,
        "orders": 35
      }
    ]
  }
}
```

**5. Các mã lỗi thường gặp:**

* `401 Unauthorized`: Lỗi xác thực Token.
* `403 Forbidden`: Tài khoản gọi API không có quyền Admin.

---

#### 2. API CẬP NHẬT CẤU HÌNH CỬA HÀNG (UPDATE SHOP CONFIG)

**Tên API:** Quản lý cấu hình chung của cửa hàng
**1. Mô tả tổng quan:** API cho phép Admin cập nhật các thông số cơ bản của website như tên shop, logo, thông tin liên hệ. Dữ liệu được lưu trữ tại bảng `shop_config`.
**2. Thông tin kết nối:**

* **Method (Phương thức):** PUT
* **Endpoint (Đường dẫn):** `/api/v1/admin/config`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                          |
| :------------ | :-------------- | :--------- | :----------------------------------------------- |
| shopName      | String          | Có        | Tên hiển thị của cửa hàng.                 |
| logoUrl       | String          | Có        | Đường dẫn ảnh Logo (lưu trên Cloudinary). |
| contactEmail  | String          | Có        | Email liên hệ hỗ trợ.                        |
| hotlineNumber | String          | Có        | Số điện thoại Hotline.                       |

**4. Kết quả trả về (Response):**

* Trả về Status 200 với thông báo "Cập nhật cấu hình cửa hàng thành công".

---

#### 3. API QUẢN LÝ BANNER QUẢNG CÁO (CREATE BANNER)

**Tên API:** Thêm mới hình ảnh Banner quảng cáo
**1. Mô tả tổng quan:** Cho phép Admin tải lên hoặc cấu hình các hình ảnh quảng cáo nổi bật (banners) hiển thị trên trang chủ của khách hàng.
**2. Thông tin kết nối:**

* **Method (Phương thức):** POST
* **Endpoint (Đường dẫn):** `/api/v1/admin/banners`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Cấu trúc Dữ liệu gửi đi (Request Body):**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                                           |
| :------------ | :-------------- | :--------- | :---------------------------------------------------------------- |
| imageUrl      | String          | Có        | Đường dẫn URL của hình ảnh banner.                         |
| targetUrl     | String          | Không     | Đường link điều hướng khi người dùng click vào banner. |
| isActive      | Boolean         | Có        | Trạng thái hiển thị (`true`/`false`).                     |
| displayOrder  | Number          | Không     | Thứ tự hiển thị của banner trên trang chủ.                 |

**4. Kết quả trả về (Response):**

* Trả về Status `201` với thông báo `"Thêm mới Banner thành công"`.

---

#### 4. API QUẢN LÝ NGƯỜI DÙNG (GET ALL USERS)

**Tên API:** Lấy danh sách toàn bộ người dùng hệ thống
**1. Mô tả tổng quan:** Cung cấp cho Admin danh sách toàn bộ khách hàng và nhân sự (bảng `users`) đang sử dụng hệ thống để thực hiện các nghiệp vụ quản lý (như khóa tài khoản, cấp lại mật khẩu thủ công). API hỗ trợ phân trang và tìm kiếm theo email/số điện thoại.
**2. Thông tin kết nối:**

* **Method (Phương thức):** GET
* **Endpoint (Đường dẫn):** `/api/v1/admin/users`
  **3. Yêu cầu gửi đi (Request):**
* **Headers:** Authorization: Bearer `<token>`
* **Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                                                      |
| :------- | :-------------- | :--------- | :----------------------------------------------------------- |
| keyword  | String          | Không     | Tìm kiếm theo Tên, Email hoặc Số điện thoại.         |
| role     | String          | Không     | Lọc theo phân quyền (`ROLE_USER` hoặc `ROLE_ADMIN`). |
| page     | Number          | Không     | Vị trí trang hiện tại (Mặc định 0).                   |
| size     | Number          | Không     | Số lượng hiển thị mỗi trang (Mặc định 10).          |

**4. Kết quả trả về (Response):**

* **Ví dụ gói dữ liệu nhận về (JSON):**

```json
{
  "status": 200,
  "message": "Thành công",
  "payload": {
    "content": [
      {
        "userId": 1,
        "email": "khachhang@gmail.com",
        "fullName": "Nguyễn Văn A",
        "roles": ["ROLE_USER"],
        "isActive": true,
        "createdAt": "2026-01-10T08:00:00"
      }
    ],
    "totalPages": 12,
    "totalElements": 115
  }
}
```
