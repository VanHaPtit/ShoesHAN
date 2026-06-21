package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Address;
import com.shop.backend.Entity.User;
import com.shop.backend.Repository.UserRepository;
import com.shop.backend.Service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public org.springframework.data.domain.Page<User> getAllPage(org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }

    @Override
    @Transactional
    public User create(User user) {
        user.setCreatedAt(LocalDateTime.now());
        // Chỉ mã hóa nếu mật khẩu chưa được mã hóa (kiểm tra tiền tố $2a$ của BCrypt)
        if (!user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User update(Long id, User userDetails) {
        User existingUser = getById(id);

        existingUser.setFullName(userDetails.getFullName());
        existingUser.setPhone(userDetails.getPhone());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setImageAvt(userDetails.getImageAvt());
        existingUser.setEnabled(userDetails.getEnabled());
        
        if (userDetails.getAddress() != null) {
            Address address = existingUser.getAddress();
            if (address == null) {
                address = new Address();
            }
            address.setProvince(userDetails.getAddress().getProvince());
            address.setWard(userDetails.getAddress().getWard());
            address.setSpecificAddress(userDetails.getAddress().getSpecificAddress());
            address.setUser(existingUser);
            existingUser.setAddress(address);
        }

        // Nếu có mật khẩu mới thì mã hóa trước khi lưu
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()
                && !userDetails.getPassword().startsWith("$2a$")) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại!");
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<com.shop.backend.SendEmail.QualifiedUserResponse> getQualifiedUsersForEmail(com.shop.backend.SendEmail.EmailConditionRequest request) {
        LocalDateTime inactiveDateLimit = request.getInactiveDays() != null 
                ? LocalDateTime.now().minusDays(request.getInactiveDays()) : null;
        LocalDateTime newUserDateLimit = request.getIsNewUserDays() != null 
                ? LocalDateTime.now().minusDays(request.getIsNewUserDays()) : null;
                
        List<com.shop.backend.Entity.Enum.OrderStatus> validStatuses = java.util.Arrays.asList(
                com.shop.backend.Entity.Enum.OrderStatus.PAID,
                com.shop.backend.Entity.Enum.OrderStatus.DELIVERED
        );

        List<User> users = userRepository.findUsersByComplexConditions(
                request.getMinTotalSpent(),
                request.getMinPaidCount(),
                inactiveDateLimit,
                request.getHasAbandonedCart(),
                request.getSpecificReviewRating(),
                newUserDateLimit,
                validStatuses
        );

        return users.stream()
                .map(u -> new com.shop.backend.SendEmail.QualifiedUserResponse(u.getId(), u.getEmail(), 0))
                .toList();
    }
}
