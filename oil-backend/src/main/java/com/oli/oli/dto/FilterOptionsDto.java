package com.oli.oli.dto;

import java.util.List;

public record FilterOptionsDto(
        List<String> tags,
        List<String> sizes,
        List<SortOption> sortOptions
) {
    public record SortOption(String value, String label) {
    }
}

