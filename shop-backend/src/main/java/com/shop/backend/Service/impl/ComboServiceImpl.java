package com.shop.backend.Service.impl;

import com.shop.backend.Entity.Combo;
import com.shop.backend.Repository.ComboRepository;
import com.shop.backend.Service.ComboService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComboServiceImpl implements ComboService {

    @Autowired
    private ComboRepository comboRepository;

    @Override
    public List<Combo> getAll() {
        return comboRepository.findAll();
    }

    @Override
    public Combo getById(Long id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Combo với ID: " + id));
    }

    @Override
    @Transactional
    public Combo create(Combo combo) {
        if (combo.getStartDate().isAfter(combo.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải bé hơn ngay kết thúc");
        }
        else{
            return comboRepository.save(combo);
        }
    }

    @Override
    @Transactional
    public Combo update(Long id, Combo comboDetails) {
        Combo existingCombo = getById(id);

        existingCombo.setName(comboDetails.getName());
        existingCombo.setComboPrice(comboDetails.getComboPrice());
        existingCombo.setStartDate(comboDetails.getStartDate());
        existingCombo.setEndDate(comboDetails.getEndDate());

        if (comboDetails.getProducts() != null) {
            existingCombo.setProducts(comboDetails.getProducts());
        }

        return comboRepository.save(existingCombo);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!comboRepository.existsById(id)) {
            throw new RuntimeException("Combo không tồn tại!");
        }
        comboRepository.deleteById(id);
    }

    @Override
    public List<Combo> getActiveCombos() {
        return comboRepository.findActiveCombos(LocalDateTime.now());
    }
}
