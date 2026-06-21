package com.shop.backend.Service;

import com.shop.backend.Entity.Combo;

import java.util.List;

public interface ComboService {
    List<Combo> getAll();
    Combo getById(Long id);
    Combo create(Combo combo);
    Combo update(Long id, Combo comboDetails);
    void delete(Long id);

    // Lấy danh sách những combo còn hoạt động
    List<Combo> getActiveCombos();
}
