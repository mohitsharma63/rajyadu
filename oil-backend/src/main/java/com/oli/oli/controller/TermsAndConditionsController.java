package com.oli.oli.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.TermsAndConditionsDto;
import com.oli.oli.model.TermsAndConditions;
import com.oli.oli.repository.TermsAndConditionsRepository;

@RestController
@RequestMapping("/api/terms-conditions")
public class TermsAndConditionsController {

    private final TermsAndConditionsRepository termsRepository;

    public TermsAndConditionsController(TermsAndConditionsRepository termsRepository) {
        this.termsRepository = termsRepository;
    }

    @GetMapping
    public List<TermsAndConditionsDto> list() {
        return termsRepository.findByIsActiveOrderBySectionOrderAsc(true)
                .stream()
                .map(TermsAndConditionsController::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/admin/all")
    public List<TermsAndConditionsDto> listAll() {
        return termsRepository.findAll()
                .stream()
                .map(TermsAndConditionsController::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TermsAndConditionsDto get(@PathVariable Long id) {
        TermsAndConditions terms = termsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terms section not found"));
        return toDto(terms);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TermsAndConditionsDto create(@RequestBody TermsAndConditionsDto dto) {
        // Set order if not provided
        if (dto.getSectionOrder() == null) {
            Integer maxOrder = termsRepository.findMaxSectionOrder();
            dto.setSectionOrder(maxOrder != null ? maxOrder + 1 : 1);
        }

        TermsAndConditions terms = new TermsAndConditions();
        terms.setSectionTitle(dto.getSectionTitle());
        terms.setSectionContent(dto.getSectionContent());
        terms.setSectionOrder(dto.getSectionOrder());
        terms.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        terms.setLastUpdated(java.time.LocalDateTime.now());

        TermsAndConditions saved = termsRepository.save(terms);
        return toDto(saved);
    }

    @PutMapping("/{id}")
    public TermsAndConditionsDto update(@PathVariable Long id, @RequestBody TermsAndConditionsDto dto) {
        TermsAndConditions terms = termsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terms section not found"));

        terms.setSectionTitle(dto.getSectionTitle());
        terms.setSectionContent(dto.getSectionContent());
        terms.setSectionOrder(dto.getSectionOrder());
        terms.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : terms.getIsActive());
        terms.setLastUpdated(java.time.LocalDateTime.now());

        TermsAndConditions saved = termsRepository.save(terms);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        TermsAndConditions terms = termsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terms section not found"));

        termsRepository.delete(terms);
    }

    private static TermsAndConditionsDto toDto(TermsAndConditions t) {
        return new TermsAndConditionsDto(
                t.getId(),
                t.getSectionTitle(),
                t.getSectionContent(),
                t.getSectionOrder(),
                t.getIsActive(),
                t.getLastUpdated() != null ? t.getLastUpdated().toString() : null
        );
    }
}
