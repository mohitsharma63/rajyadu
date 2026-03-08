package com.oli.oli.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.oli.oli.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    @Query(value = "SELECT p.* FROM products p WHERE " +
            "(:q IS NULL OR LOWER(p.name) LIKE LOWER('%' || :q || '%') OR " +
            "(p.description IS NOT NULL AND LOWER(CAST(p.description AS TEXT)) LIKE LOWER('%' || :q || '%'))) AND " +
            "(:categoryId IS NULL OR p.category_id = :categoryId) AND " +
            "(:subCategoryId IS NULL OR (p.sub_category_id IS NOT NULL AND p.sub_category_id = :subCategoryId)) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:inStock IS NULL OR p.in_stock = :inStock) AND " +
            "(:featured IS NULL OR p.featured = :featured)", nativeQuery = true)
    List<Product> findByFilters(@Param("q") String q,
                                @Param("categoryId") Long categoryId,
                                @Param("subCategoryId") Long subCategoryId,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                @Param("inStock") Boolean inStock,
                                @Param("featured") Boolean featured);

    @Query("SELECT DISTINCT p.tagsCsv FROM Product p WHERE p.tagsCsv IS NOT NULL AND p.tagsCsv != ''")
    List<String> findAllTags();

    @Query(value = "SELECT DISTINCT size FROM products WHERE size IS NOT NULL AND size != '' ORDER BY size", nativeQuery = true)
    List<String> findDistinctSizes();
}
