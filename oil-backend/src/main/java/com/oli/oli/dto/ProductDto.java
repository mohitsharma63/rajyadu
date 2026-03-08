package com.oli.oli.dto;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        Long categoryId,
        Long subCategoryId,
        String name,
        String slug,
        String shortDescription,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        Double rating,
        Integer reviewCount,
        String size,
        String saleOffer,
        String tags,
        boolean inStock,
        boolean featured,
        boolean bestseller,
        boolean newLaunch,
        String imageUrl
) {
}
