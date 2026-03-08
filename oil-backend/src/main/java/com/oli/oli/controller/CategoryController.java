package com.oli.oli.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.CategoryDto;
import com.oli.oli.model.Category;
import com.oli.oli.repository.CategoryRepository;
import com.oli.oli.service.FileStorageService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public CategoryController(CategoryRepository categoryRepository, FileStorageService fileStorageService) {
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return categoryRepository.findAll().stream().map(CategoryController::toDto).toList();
    }

    @GetMapping("/{id}")
    public CategoryDto get(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        return toDto(category);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto create(
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeImage(image, "categories");
            category.setImageUrl(imageUrl);
        }

        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CategoryDto update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        categoryRepository.findBySlug(slug)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
                });

        category.setName(name);
        category.setSlug(slug);

        if (image != null && !image.isEmpty()) {
            fileStorageService.deleteIfExistsByUrl(category.getImageUrl());
            String imageUrl = fileStorageService.storeImage(image, "categories");
            category.setImageUrl(imageUrl);
        }

        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        fileStorageService.deleteIfExistsByUrl(category.getImageUrl());
        categoryRepository.delete(category);
    }

    private static CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getImageUrl());
    }
}
