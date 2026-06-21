package com.shop.backend.Controller;

import com.shop.backend.Entity.Cart;
import com.shop.backend.Entity.Enum.RoleName;
import com.shop.backend.Entity.Request.LoginRequest;
import com.shop.backend.Entity.Request.SignupRequest;
import com.shop.backend.Entity.Response.UserInfoResponse;
import com.shop.backend.Entity.Role;
import com.shop.backend.Entity.User;
import com.shop.backend.Repository.CartRepository;
import com.shop.backend.Repository.RoleRepository;
import com.shop.backend.Repository.UserRepository;
import com.shop.backend.Security.JwtUtils;
import com.shop.backend.Service.CartService;
import com.shop.backend.Service.UserService;
import com.shop.backend.Service.impl.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired AuthenticationManager authenticationManager;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired JwtUtils jwtUtils;
    @Autowired UserService userService;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    com.shop.backend.SendEmail.SendGridMailService sendGridMailService;

    @org.springframework.beans.factory.annotation.Value("${BACKEND_URL:http://shopshoes.site}")
    private String backendUrl;
//    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
//        // Spring Security sẽ gọi UserDetailsServiceImpl.loadUserByUsername
//        // dựa trên loginRequest.getUsername() cung cấp ở đây.
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
//
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
//
//        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);
//
//        List<String> roles = userDetails.getAuthorities().stream()
//                .map(item -> item.getAuthority()).collect(Collectors.toList());
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
//                .body(new UserInfoResponse(jwtCookie.getValue(), userDetails.getId(), userDetails.getUsername(), roles));
//    }




    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority()).collect(Collectors.toList());

        // Trả về thêm userDetails.getFullName()
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new UserInfoResponse(
                        jwtCookie.getValue(),
                        userDetails.getId(),
                        userDetails.getUsername(),
                        userDetails.getFullName(),
                        userDetails.getDateOfBirth(),
                        roles));
    }






    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // 1. Kiểm tra trùng lặp Username thay vì chỉ kiểm tra Email
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }

        // 2. Khởi tạo đối tượng User và gán Username
        User user = new User();
        user.setUsername(signUpRequest.getUsername()); // Gán username từ request
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setDateOfBirth(signUpRequest.getDateOfBirth());

        // 3. Xử lý phân quyền
        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            roles.add(roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role not found.")));
        } else {
            strRoles.forEach(r -> {
                String roleName = r.startsWith("ROLE_") ? r.toUpperCase() : "ROLE_" + r.toUpperCase();
                Role role = roleRepository.findByName(RoleName.valueOf(roleName))
                        .orElseThrow(() -> new RuntimeException("Error: Role " + r + " not found."));
                roles.add(role);
            });
        }
        user.setRoles(roles);

        // 4. Sinh mã xác nhận và thiết lập trạng thái
        user.setEnabled(false); // Chưa kích hoạt
        String verificationCode = java.util.UUID.randomUUID().toString();
        user.setVerificationCode(verificationCode);

        // 5. Lưu User thông qua Service (để xử lý mã hóa mật khẩu)
        userService.create(user);

        // 6. Tạo sẵn giỏ hàng
        Cart emptyCart = new Cart();
        emptyCart.setUser(user);
        emptyCart.setTotalBill(0.0);
        cartRepository.save(emptyCart);

        // 7. Gửi email xác nhận
        com.shop.backend.SendEmail.EmailRequest emailRequest = new com.shop.backend.SendEmail.EmailRequest();
        emailRequest.setToEmail(user.getEmail());
        emailRequest.setSubject("Kích hoạt tài khoản SHOES HAN");
        String verificationUrl = backendUrl + "/api/v1/auth/verify?code=" + verificationCode;
        emailRequest.setContent("Chào " + user.getUsername() + ",\n\nVui lòng click vào đường link sau để kích hoạt tài khoản của bạn:\n" + verificationUrl);
        sendGridMailService.sendMail(emailRequest);

        return ResponseEntity.ok("User registered successfully! Please check your email to verify your account.");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("code") String code) {
        return userRepository.findByVerificationCode(code).map(user -> {
            user.setEnabled(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return ResponseEntity.ok("Xác nhận tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
        }).orElseGet(() -> ResponseEntity.badRequest().body("Mã xác nhận không hợp lệ hoặc tài khoản đã được kích hoạt."));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("You've been signed out!");
    }
}