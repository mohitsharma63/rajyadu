package com.oli.oli.controller;

import java.math.BigDecimal;
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

import com.oli.oli.dto.FilterOptionsDto;
import com.oli.oli.dto.ProductDto;
import com.oli.oli.model.Category;
import com.oli.oli.model.Product;
import com.oli.oli.model.SubCategory;
import com.oli.oli.repository.CategoryRepository;
import com.oli.oli.repository.ProductRepository;
import com.oli.oli.repository.SubCategoryRepository;
import com.oli.oli.service.FileStorageService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final FileStorageService fileStorageService;

    public ProductController(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            SubCategoryRepository subCategoryRepository,
            FileStorageService fileStorageService
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<ProductDto> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "inStock", required = false) Boolean inStock,
            @RequestParam(value = "featured", required = false) Boolean featured
    ) {
        return productRepository.findByFilters(q, categoryId, subCategoryId, minPrice, maxPrice, inStock, featured)
                .stream()
                .map(ProductController::toDto)
                .toList();
    }

    @GetMapping("/filters")
    public FilterOptionsDto getFilterOptions() {
        // Get all tags from products and split by comma
        List<String> allTags = productRepository.findAllTags();
        List<String> tags = allTags.stream()
                .flatMap(tagsCsv -> {
                    if (tagsCsv == null || tagsCsv.isEmpty()) {
                        return java.util.stream.Stream.empty();
                    }
                    return Arrays.stream(tagsCsv.split(","))
                            .map(String::trim)
                            .filter(tag -> !tag.isEmpty());
                })
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        List<String> sizes = productRepository.findDistinctSizes();

        List<FilterOptionsDto.SortOption> sortOptions = new ArrayList<>();
        sortOptions.add(new FilterOptionsDto.SortOption("popular", "Most Popular"));
        sortOptions.add(new FilterOptionsDto.SortOption("price-low", "Price: Low to High"));
        sortOptions.add(new FilterOptionsDto.SortOption("price-high", "Price: High to Low"));
        sortOptions.add(new FilterOptionsDto.SortOption("newest", "Newest First"));
        sortOptions.add(new FilterOptionsDto.SortOption("rating", "Highest Rated"));

        return new FilterOptionsDto(tags, sizes, sortOptions);
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toDto(product);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) BigDecimal originalPrice,
            @RequestParam(value = "rating", required = false) Double rating,
            @RequestParam(value = "reviewCount", required = false) Integer reviewCount,
            @RequestParam(value = "size", required = false) String size,
            @RequestParam(value = "saleOffer", required = false) String saleOffer,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "inStock", required = false, defaultValue = "false") boolean inStock,
            @RequestParam(value = "featured", required = false, defaultValue = "false") boolean featured,
            @RequestParam(value = "bestseller", required = false, defaultValue = "false") boolean bestseller,
            @RequestParam(value = "newLaunch", required = false, defaultValue = "false") boolean newLaunch,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        if (productRepository.findBySlug(slug).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        SubCategory subCategory = null;
        if (subCategoryId != null) {
            subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubCategory not found"));
            if (subCategory.getCategory() == null || !subCategory.getCategory().getId().equals(categoryId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SubCategory does not belong to category");
            }
        }

        Product product = new Product();
        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setName(name);
        product.setSlug(slug);
        product.setShortDescription(shortDescription);
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setRating(rating);
        product.setReviewCount(reviewCount);
        product.setSize(size);
        product.setSaleOffer(saleOffer);
        product.setTagsCsv(tags);
        product.setInStock(inStock);
        product.setFeatured(featured);
        product.setBestseller(bestseller);
        product.setNewLaunch(newLaunch);

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(fileStorageService.storeImage(image, "products"));
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductDto update(
            @PathVariable Long id,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) BigDecimal originalPrice,
            @RequestParam(value = "rating", required = false) Double rating,
            @RequestParam(value = "reviewCount", required = false) Integer reviewCount,
            @RequestParam(value = "size", required = false) String size,
            @RequestParam(value = "saleOffer", required = false) String saleOffer,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "inStock", required = false) Boolean inStock,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "bestseller", required = false) Boolean bestseller,
            @RequestParam(value = "newLaunch", required = false) Boolean newLaunch,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (slug != null) {
            productRepository.findBySlug(slug)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
                    });
            product.setSlug(slug);
        }

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            product.setCategory(category);
        }

        if (subCategoryId != null) {
            SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubCategory not found"));
            Long effectiveCategoryId = categoryId != null ? categoryId
                    : (product.getCategory() == null ? null : product.getCategory().getId());
            if (effectiveCategoryId == null || subCategory.getCategory() == null || !subCategory.getCategory().getId().equals(effectiveCategoryId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SubCategory does not belong to category");
            }
            product.setSubCategory(subCategory);
        }

        if (name != null) {
            product.setName(name);
        }
        if (shortDescription != null) {
            product.setShortDescription(shortDescription);
        }
        if (description != null) {
            product.setDescription(description);
        }
        if (price != null) {
            product.setPrice(price);
        }
        if (originalPrice != null) {
            product.setOriginalPrice(originalPrice);
        }
        if (rating != null) {
            product.setRating(rating);
        }
        if (reviewCount != null) {
            product.setReviewCount(reviewCount);
        }
        if (size != null) {
            product.setSize(size);
        }
        if (saleOffer != null) {
            product.setSaleOffer(saleOffer);
        }
        if (tags != null) {
            product.setTagsCsv(tags);
        }
        if (inStock != null) {
            product.setInStock(inStock);
        }
        if (featured != null) {
            product.setFeatured(featured);
        }
        if (bestseller != null) {
            product.setBestseller(bestseller);
        }
        if (newLaunch != null) {
            product.setNewLaunch(newLaunch);
        }

        if (image != null && !image.isEmpty()) {
            fileStorageService.deleteIfExistsByUrl(product.getImageUrl());
            product.setImageUrl(fileStorageService.storeImage(image, "products"));
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        fileStorageService.deleteIfExistsByUrl(product.getImageUrl());
        productRepository.delete(product);
    }

    private static ProductDto toDto(Product p) {
        Long categoryId = p.getCategory() == null ? null : p.getCategory().getId();
        Long subCategoryId = p.getSubCategory() == null ? null : p.getSubCategory().getId();

        return new ProductDto(
                p.getId(),
                categoryId,
                subCategoryId,
                p.getName(),
                p.getSlug(),
                p.getShortDescription(),
                p.getDescription(),
                p.getPrice(),
                p.getOriginalPrice(),
                p.getRating(),
                p.getReviewCount(),
                p.getSize(),
                p.getSaleOffer(),
                p.getTagsCsv(),
                p.isInStock(),
                p.isFeatured(),
                p.isBestseller(),
                p.isNewLaunch(),
                p.getImageUrl()
        );
    }
}
