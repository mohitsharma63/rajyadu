package com.oli.oli.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.UserDto;
import com.oli.oli.model.User;
import com.oli.oli.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    public record AdminLoginRequest(String email, String password) {
    }

    public record AdminAuthResponse(String message, UserDto user) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public AdminAuthResponse login(@RequestBody AdminLoginRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        if (!StringUtils.hasText(req.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }

        String email = req.email().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (user.getIsAdmin() == null || !user.getIsAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Admin privileges required.");
        }

        UserDto dto = new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getIsAdmin(),
                user.getPhoneVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        return new AdminAuthResponse("Admin login successful", dto);
    }
}

