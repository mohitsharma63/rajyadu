package com.oli.oli.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.oli.oli.model.TermsAndConditions;

@Repository
public interface TermsAndConditionsRepository extends JpaRepository<TermsAndConditions, Long> {
    
    List<TermsAndConditions> findByIsActiveOrderBySectionOrderAsc(Boolean isActive);
    
    Optional<TermsAndConditions> findBySectionTitleAndIsActive(String sectionTitle, Boolean isActive);
    
    @Query("SELECT MAX(t.sectionOrder) FROM TermsAndConditions t WHERE t.isActive = true")
    Integer findMaxSectionOrder();
}
