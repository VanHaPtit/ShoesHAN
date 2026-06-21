package com.shop.backend.Config;

import com.shop.backend.Security.AuthEntryPointJwt;
import com.shop.backend.Security.AuthTokenFilter;
import com.shop.backend.Service.impl.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableMethodSecurity // Cho phép phân quyền bằng @PreAuthorize trong Controller
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    // --- 1. Filter xử lý Token JWT ---
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    // --- 2. Cấu hình kiểm tra Tài khoản & Mật khẩu ---
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // --- 5. CHUỖI BỘ LỌC BẢO MẬT (Security Filter Chain) ---
    // Trong file SecurityConfig.java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    // Cho phép mọi origin để tránh lỗi CORS khi truy cập bằng IP LAN hoặc localhost
                    config.setAllowedOriginPatterns(List.of("*"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Cho phép tất cả các yêu cầu OPTIONS (CORS Preflight)
                        .requestMatchers("/api/v1/auth/**").permitAll()        // Cho phép Đăng nhập/Đăng ký
                        .requestMatchers(HttpMethod.GET, "/api/v1/product/**").permitAll() // CHO PHÉP XEM SẢN PHẨM CÔNG KHAI
                        .requestMatchers(HttpMethod.GET, "/api/v1/config/**").permitAll() // Cho phép lấy banner
                        .requestMatchers("/api/v1/paypal/success/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/variant/**").permitAll()
                        .requestMatchers("/api/v1/paypal/**").authenticated()
                        .requestMatchers("/api/v1/payment/vn-pay/**").authenticated()
                        .requestMatchers("/api/v1/mail/**").authenticated()
                        .requestMatchers("/api/v1/payment/vn-pay-callback/**").permitAll()
                        .requestMatchers("/api/v1/auth/forgot-password**").permitAll()
                        .requestMatchers("/api/v1/Excel/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/v1/chat/**").authenticated()
                        .requestMatchers("/api/v1/statistics/**").authenticated()
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        .requestMatchers("/api/v1/carts/**", "/api/v1/cart-items/**", "/api/v1/cart-items").authenticated()
                        .anyRequest().authenticated()                       // Các thao tác khác phải đăng nhập
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }



}
