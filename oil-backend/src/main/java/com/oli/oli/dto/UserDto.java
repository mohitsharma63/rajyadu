package com.oli.oli.dto;

import java.time.Instant;

public record UserDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Boolean isAdmin,
        Boolean phoneVerified,
        Instant createdAt,
        Instant updatedAt
) {
}
