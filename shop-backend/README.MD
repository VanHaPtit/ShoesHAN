# Shoe Shop
##  Giới thiệu

**Shoe Shop Backend API** là hệ thống backend hoàn chỉnh cho một nền tảng thương mại điện tử chuyên về giày dép. Dự án được xây dựng trên nền tảng **Spring Boot**, cung cấp các API RESTful phục vụ quản lý sản phẩm, xử lý đơn hàng, tích hợp thanh toán và hỗ trợ khách hàng thông qua trợ lý ảo AI tích hợp **Google Gemini**.

---

## Công nghệ sử dụng

| Nhóm | Công nghệ |
|------|-----------|
| **Ngôn ngữ & Framework** | Java 17+, Spring Boot |
| **Bảo mật** | Spring Security, JWT Authentication |
| **ORM & Database** | Spring Data JPA (Hibernate), MySQL / PostgreSQL |
| **AI** | Google Gemini API |
| **Thanh toán** | PayPal API, VNPay API |
| **Lưu trữ media** | Cloudinary |
| **Email** | SendGrid |
| **Build tool** | Maven |

---

## Tính năng chính

### 1. Quản lý Sản phẩm & Kinh doanh

<details>
<summary><strong>Xem chi tiết</strong></summary>

**Sản phẩm & Biến thể**
- Phân loại theo giới tính: `MEN` | `WOMEN` | `UNISEX`
- Quản lý thuộc tính: chất liệu, loại đế
- Biến thể linh hoạt theo kích thước và màu sắc

**Danh mục & Thương hiệu**
- Tổ chức sản phẩm theo danh mục phân cấp
- Quản lý thương hiệu kèm hình ảnh đại diện

**Combo khuyến mãi**
- Tạo gói sản phẩm khuyến mãi theo thời gian
- Thiết lập thời gian hiệu lực cụ thể

**Giỏ hàng thông minh**
- Tự động gộp sản phẩm cùng biến thể
- Tính toán tổng tiền theo thời gian thực

</details>

---

### 2. Hệ thống Đơn hàng & Thanh toán

<details>
<summary><strong>Xem chi tiết</strong></summary>

**Xử lý đơn hàng an toàn**
- Cơ chế `@Retryable` để giải quyết xung đột khi nhiều người mua cùng lúc
- Trừ kho an toàn, tránh overselling

**PayPal**
- Tự động lấy tỷ giá thực tế qua API
- Chuyển đổi VND → USD trước khi tạo giao dịch

**VNPay**
- Hỗ trợ đầy đủ các ngân hàng nội địa Việt Nam
- Xử lý callback an toàn với HMAC-SHA512

**COD (Cash on Delivery)**
- Thanh toán khi nhận hàng, không cần tích hợp thêm

</details>

---

### 3. Trợ lý ảo AI — *Shoe Shop Assistant*

<details>
<summary><strong>Xem chi tiết</strong></summary>

**Tư vấn sản phẩm thông minh**
- Phân tích ý định và nhu cầu người dùng
- Gợi ý sản phẩm phù hợp từ kho dữ liệu thực tế

**Tra cứu đơn hàng**
- Kiểm tra trạng thái đơn hàng theo mã `orderNumber`

**Công cụ tích hợp (Function Calling)**
- Tìm kiếm sản phẩm theo từ khóa và bộ lọc
- Lấy thông tin chi tiết sản phẩm
- Kiểm tra tồn kho theo biến thể

</details>

---

### 4.Thành viên & Đánh giá

<details>
<summary><strong>Xem chi tiết</strong></summary>

**Xác thực & Bảo mật**
- Đăng ký, đăng nhập với JWT
- Tự động khởi tạo giỏ hàng cho người dùng mới

**Hồ sơ cá nhân**
- Cập nhật thông tin cá nhân
- Upload ảnh đại diện qua Cloudinary

**Đánh giá sản phẩm**
- Gửi đánh giá kèm nhiều hình ảnh thực tế
- Quản lý và hiển thị đánh giá theo sản phẩm

</details>

---

## Kiến trúc hệ thống

Dự án được tổ chức theo mô hình **Layered Architecture** (kiến trúc nhiều lớp):

```
┌─────────────────────────────────────────────┐
│                   CLIENT                    │
└──────────────────────┬──────────────────────┘
                       │ HTTP Request
┌──────────────────────▼──────────────────────┐
│              CONTROLLER LAYER               │  ← Xử lý request / response
├─────────────────────────────────────────────┤
│               SERVICE LAYER                 │  ← Xử lý logic nghiệp vụ
├─────────────────────────────────────────────┤
│             REPOSITORY LAYER                │  ← Tương tác với database
├─────────────────────────────────────────────┤
│           DATABASE (MySQL / PostgreSQL)     │
└─────────────────────────────────────────────┘

  DTO    ←→  Truyền dữ liệu giữa các tầng
  Entity ←→  Ánh xạ cấu trúc bảng database
```

### Cấu trúc thư mục

```
shoe-shop-backend/
├── src/
│   ├── main/
│   │   ├── java/com/shoeshop/
│   │   │   ├── controller/          # REST Controllers
│   │   │   ├── service/             # Business Logic
│   │   │   ├── repository/          # Data Access Layer (JPA)
│   │   │   ├── model/               # Entity Classes
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── security/            # JWT & Spring Security config
│   │   │   ├── payment/             # PayPal & VNPay integration
│   │   │   └── ai/                  # Gemini AI & Function Calling
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

---

## Cài đặt và chạy dự án

### Yêu cầu hệ thống

### Bước 1 — Clone repository

```bash
  git clone https://github.com/VanHaPtit/shop-backend.git
  cd shop-backend
```

### Bước 2 — Build & chạy

```bash
# Build dự án
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

##  Tài liệu API

###  Xác thực & Người dùng

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|:----:|
| `POST` | `/api/v1/auth/signup` | Đăng ký tài khoản mới | ✗ |
| `POST` | `/api/v1/auth/signin` | Đăng nhập, nhận JWT | ✗ |
| `GET` | `/api/v1/users/{id}` | Lấy thông tin người dùng | ✓ |
| `PUT` | `/api/v1/users/{id}` | Cập nhật hồ sơ cá nhân | ✓ |


###  Sản phẩm & Danh mục

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|:----:|
| `GET` | `/api/v1/product` | Danh sách / lọc sản phẩm | ✗ |
| `GET` | `/api/v1/product/{id}` | Chi tiết một sản phẩm | ✗ |
| `POST` | `/api/v1/product` | Tạo sản phẩm mới | ✓ ADMIN |
| `PUT` | `/api/v1/product/{id}` | Cập nhật sản phẩm | ✓ ADMIN |
| `DELETE` | `/api/v1/product/{id}` | Xóa sản phẩm | ✓ ADMIN |


### Giỏ hàng & Đơn hàng

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|:----:|
| `GET` | `/api/v1/cart` | Xem giỏ hàng hiện tại | ✓ |
| `POST` | `/api/v1/cart/add` | Thêm sản phẩm vào giỏ | ✓ |
| `PUT` | `/api/v1/cart/{itemId}` | Cập nhật số lượng | ✓ |
| `DELETE` | `/api/v1/cart/{itemId}` | Xóa sản phẩm khỏi giỏ | ✓ |
| `POST` | `/api/v1/orders` | Tạo đơn hàng (COD / Online) | ✓ |
| `GET` | `/api/v1/orders/my-history` | Lịch sử mua hàng cá nhân | ✓ |
| `GET` | `/api/v1/orders/{id}` | Chi tiết đơn hàng | ✓ |


### Thanh toán

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/v1/payment/paypal/create` | Tạo phiên thanh toán PayPal |
| `GET` | `/api/v1/payment/paypal/success` | Callback xác nhận PayPal |
| `POST` | `/api/v1/payment/vnpay/create` | Tạo phiên thanh toán VNPay |
| `GET` | `/api/v1/payment/vnpay/callback` | Callback xác nhận VNPay |


##  Cổng thanh toán

### PayPal

```
Người dùng
    │  POST /payment/paypal/create
    ▼
Hệ thống lấy tỷ giá VND/USD thực tế
    │
    ▼
Tạo giao dịch PayPal (USD)
    │
    ▼
Redirect đến PayPal Checkout
    │
    ▼  GET /payment/paypal/success (callback)
Xác nhận & cập nhật trạng thái đơn hàng 
```

### VNPay

```
Người dùng
    │  POST /payment/vnpay/create
    ▼
Tạo URL thanh toán (ký HMAC-SHA512)
    │
    ▼
Redirect đến cổng VNPay
    │
    ▼  GET /payment/vnpay/callback
Xác minh chữ ký & cập nhật đơn hàng 
```