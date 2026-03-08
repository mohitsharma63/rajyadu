package com.oli.oli.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
}
