package com.oli.oli.dto;

import java.util.List;

public record UserPageResponse(
        List<UserDto> users,
        long total,
        int page,
        int pageSize,
        int totalPages
) {
}

