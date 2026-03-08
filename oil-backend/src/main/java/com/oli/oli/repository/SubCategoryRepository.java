package com.oli.oli.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.SubCategory;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryId(Long categoryId);
}
