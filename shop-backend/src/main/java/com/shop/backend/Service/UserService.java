package com.shop.backend.Service;

import com.shop.backend.Entity.User;
import com.shop.backend.SendEmail.EmailConditionRequest;
import com.shop.backend.SendEmail.QualifiedUserResponse;

import java.util.List;

public interface UserService {
    List<User> getAll();
    org.springframework.data.domain.Page<User> getAllPage(org.springframework.data.domain.Pageable pageable);
    User create (User user) ;
    User update(Long id, User user) ;
    User getById(Long id) ;
    void delete (Long id) ;

    List<QualifiedUserResponse> getQualifiedUsersForEmail(EmailConditionRequest request);
}
