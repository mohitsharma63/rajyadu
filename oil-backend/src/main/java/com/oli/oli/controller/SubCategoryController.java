package com.oli.oli.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.SubCategoryDto;
import com.oli.oli.model.Category;
import com.oli.oli.model.SubCategory;
import com.oli.oli.repository.CategoryRepository;
import com.oli.oli.repository.SubCategoryRepository;

@RestController
@RequestMapping("/api/subcategories")
public class SubCategoryController {

    public record UpsertSubCategoryRequest(Long categoryId, String name, String slug) {
    }

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryController(SubCategoryRepository subCategoryRepository, CategoryRepository categoryRepository) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<SubCategoryDto> list(@RequestParam(value = "categoryId", required = false) Long categoryId) {
        List<SubCategory> items = categoryId == null
                ? subCategoryRepository.findAll()
                : subCategoryRepository.findByCategoryId(categoryId);
        return items.stream().map(SubCategoryController::toDto).toList();
    }

    @GetMapping("/{id}")
    public SubCategoryDto get(@PathVariable Long id) {
        SubCategory sc = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubCategory not found"));
        return toDto(sc);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubCategoryDto create(@RequestBody UpsertSubCategoryRequest req) {
        if (req == null || req.categoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "categoryId is required");
        }
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        SubCategory sc = new SubCategory();
        sc.setCategory(category);
        sc.setName(req.name());
        sc.setSlug(req.slug());

        SubCategory saved = subCategoryRepository.save(sc);
        return toDto(saved);
    }

    @PutMapping("/{id}")
    public SubCategoryDto update(@PathVariable Long id, @RequestBody UpsertSubCategoryRequest req) {
        SubCategory sc = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubCategory not found"));

        if (req != null && req.categoryId() != null) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            sc.setCategory(category);
        }

        if (req != null) {
            sc.setName(req.name());
            sc.setSlug(req.slug());
        }

        SubCategory saved = subCategoryRepository.save(sc);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        SubCategory sc = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubCategory not found"));
        subCategoryRepository.delete(sc);
    }

    private static SubCategoryDto toDto(SubCategory sc) {
        Long categoryId = sc.getCategory() == null ? null : sc.getCategory().getId();
        return new SubCategoryDto(sc.getId(), categoryId, sc.getName(), sc.getSlug());
    }
}
