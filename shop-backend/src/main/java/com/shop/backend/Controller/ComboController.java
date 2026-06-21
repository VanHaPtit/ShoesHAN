package com.shop.backend.Controller;

import com.shop.backend.Entity.Combo;
import com.shop.backend.Service.ComboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/combos")
@CrossOrigin("*")
public class ComboController {

    @Autowired
    private ComboService comboService;

    // Lấy danh sách tất cả combo
    @GetMapping
    public List<Combo> getAll() {
        return comboService.getAll();
    }


    @GetMapping("/active")
    public List<Combo> getActiveCombos() {
        return comboService.getActiveCombos();
    }


    // Lấy chi tiết 1 combo
    @GetMapping("/{id}")
    public Combo getById(@PathVariable Long id) {
        return comboService.getById(id) ;
    }


    @PostMapping
    public Combo create(@Valid @RequestBody Combo combo) {
        return comboService.create(combo) ;
    }

    // Cập nhật combo
    @PutMapping("/{id}")
    public ResponseEntity<Combo> update(@PathVariable Long id, @Valid @RequestBody Combo comboDetails) {
        Combo existingCombo = comboService.getById(id);

        if (existingCombo != null) {
            existingCombo.setName(comboDetails.getName());
            existingCombo.setComboPrice(comboDetails.getComboPrice());
            existingCombo.setStartDate(comboDetails.getStartDate());
            existingCombo.setEndDate(comboDetails.getEndDate());
            existingCombo.setProducts(comboDetails.getProducts());
            return ResponseEntity.ok(comboService.create(existingCombo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Xóa combo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comboService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
