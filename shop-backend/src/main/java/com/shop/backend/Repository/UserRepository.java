package com.shop.backend.Repository;

import com.shop.backend.Entity.User;
import com.shop.backend.Entity.Enum.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE User u SET u.password = :password WHERE u.id = :id")
    void updatePassword(@Param("id") Long id, @Param("password") String password);

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Optional<User> findByVerificationCode(String verificationCode);

    /**
     * Finds enabled users born in a specific month.
     */
    @Query("SELECT u FROM User u WHERE MONTH(u.dateOfBirth) = :month AND u.enabled = true")
    List<User> findByBirthMonth(@Param("month") int month);

    /**
     * Advanced filtering for marketing segments (Spending, Activity, Carts, etc.)
     */
    @Query("SELECT u FROM User u WHERE u.enabled = true AND " +
            "(:minTotalSpent IS NULL OR (SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.user = u AND o.status IN :validStatuses) >= :minTotalSpent) AND "
            +
            "(:minPaidCount IS NULL OR (SELECT COUNT(o) FROM Order o WHERE o.user = u AND o.status IN :validStatuses) >= :minPaidCount) AND "
            +
            "(:inactiveDateLimit IS NULL OR NOT EXISTS (SELECT o FROM Order o WHERE o.user = u AND o.orderDate >= :inactiveDateLimit)) AND "
            +
            "(:hasAbandonedCart IS NULL OR :hasAbandonedCart = false OR EXISTS (SELECT c FROM Cart c JOIN c.items ci WHERE c.user = u)) AND "
            +
            "(:specificReviewRating IS NULL OR EXISTS (SELECT r FROM Review r WHERE r.user = u AND r.rating = :specificReviewRating)) AND "
            +
            "(:newUserDateLimit IS NULL OR u.createdAt >= :newUserDateLimit)")
    List<User> findUsersByComplexConditions(
            @Param("minTotalSpent") Double minTotalSpent,
            @Param("minPaidCount") Integer minPaidCount,
            @Param("inactiveDateLimit") LocalDateTime inactiveDateLimit,
            @Param("hasAbandonedCart") Boolean hasAbandonedCart,
            @Param("specificReviewRating") Integer specificReviewRating,
            @Param("newUserDateLimit") LocalDateTime newUserDateLimit,
            @Param("validStatuses") List<OrderStatus> validStatuses);
}