package com.shop.backend.Controller;


import com.shop.backend.Entity.Address;
import com.shop.backend.Entity.User;
import com.shop.backend.Service.CloudinaryService;
import com.shop.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin("*")
public class UserController {

    private static final Pattern VN_PHONE_PATTERN = 
            Pattern.compile("^(0[35789])([0-9]{8})$|^(84)([0-9]{9})$");

    @Autowired
    private UserService userService;

    @Autowired
    private CloudinaryService cloudinaryService;
    // 1. Lấy danh sách tất cả người dùng
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/page")
    public ResponseEntity<org.springframework.data.domain.Page<User>> getAllUsersPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase(org.springframework.data.domain.Sort.Direction.ASC.name())
                ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.getAllPage(pageable));
    }

    // 2. Lấy thông tin chi tiết một người dùng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 3. Tạo mới người dùng
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        User newUser = userService.create(user);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    // 4. Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestParam("fullName") String fullName,
            @RequestParam("phone") String phone,
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "ward", required = false) String ward,
            @RequestParam(value = "specificAddress", required = false) String specificAddress,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // 1. Lấy user hiện tại từ database
            User existingUser = userService.getById(id);

            // 2. Nếu có gửi file ảnh mới, dùng CloudinaryService để upload
            if (file != null && !file.isEmpty()) {
                String imageUrl = cloudinaryService.uploadImage(file);
                existingUser.setImageAvt(imageUrl);
            }

            // 3. Cập nhật các thông tin khác
            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Họ và tên không được để trống");
            }
            if (fullName.trim().length() < 2 || fullName.trim().length() > 255) {
                return ResponseEntity.badRequest().body("Họ và tên phải từ 2 đến 255 ký tự");
            }
            existingUser.setFullName(fullName.trim());

            if (phone != null && !phone.trim().isEmpty()) {
                if (!VN_PHONE_PATTERN.matcher(phone.trim()).matches()) {
                    return ResponseEntity.badRequest()
                            .body("Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678)");
                }
                existingUser.setPhone(phone.trim());
            } else {
                existingUser.setPhone(null);
            }

            if (province != null || ward != null || specificAddress != null) {
                Address address = existingUser.getAddress();
                if (address == null) {
                    address = new Address();
                    // address.setUser(existingUser); // This is managed by CascadeType.ALL, but we can set it if needed
                }
                if (province != null) address.setProvince(province);
                if (ward != null) address.setWard(ward);
                if (specificAddress != null) address.setSpecificAddress(specificAddress);
                existingUser.setAddress(address);
            }

            // 4. Lưu vào database
            User updatedUser = userService.update(id, existingUser);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();
            Throwable cause = e.getCause();
            while (cause != null) {
                errorMsg += " | Cause: " + cause.getMessage();
                cause = cause.getCause();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi cập nhật: " + errorMsg);
        }
    }

    // 5. Xóa người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.ok("Xóa người dùng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    // 6. Thay đổi mật khẩu người dùng (Bỏ qua validation entity)
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changeUserPassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu mới không được để trống");
            }

            User existingUser = userService.getById(id);
            // Kiểm tra mật khẩu cũ 
            if (oldPassword == null || oldPassword.isEmpty()) {
                return ResponseEntity.badRequest().body("Vui lòng nhập mật khẩu cũ");
            }
            if (!passwordEncoder.matches(oldPassword, existingUser.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu cũ không chính xác");
            }
            
            // Mã hóa mật khẩu mới
            String encodedPassword = passwordEncoder.encode(newPassword.trim());
            
            // Dùng JdbcTemplate để update trực tiếp, tránh lỗi Validation của JPA
            int updatedRows = jdbcTemplate.update(
                "UPDATE users SET password = ? WHERE id = ?",
                encodedPassword, id
            );
            
            if (updatedRows > 0) {
                return ResponseEntity.ok("Đổi mật khẩu thành công");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi đổi mật khẩu: " + e.getMessage());
        }
    }
}
