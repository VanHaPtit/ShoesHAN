package com.shop.backend.Repository;

import com.shop.backend.Entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {

    // Tìm các combo mà thời điểm hiện tại nằm trong khoảng startDate và endDate
    @Query("SELECT c FROM Combo c WHERE :now BETWEEN c.startDate AND c.endDate")
    List<Combo> findActiveCombos(@Param("now") LocalDateTime now);

}
