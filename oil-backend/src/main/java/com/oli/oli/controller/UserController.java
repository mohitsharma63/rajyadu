package com.oli.oli.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
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

import com.oli.oli.dto.UserDto;
import com.oli.oli.dto.UserPageResponse;
import com.oli.oli.model.User;
import com.oli.oli.repository.UserRepository;
import com.oli.oli.service.UserService;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public record CreateUserRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String password
    ) {
    }

    public record UpdateUserRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String password
    ) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @GetMapping
    public UserPageResponse list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder
    ) {
        // Validate pagination parameters
        if (page < 1) {
            page = 1;
        }
        if (pageSize < 1 || pageSize > 100) {
            pageSize = 10;
        }

        // Validate sortOrder parameter
        String validSortOrder = sortOrder.toLowerCase();
        if (!validSortOrder.equals("asc") && !validSortOrder.equals("desc")) {
            validSortOrder = "desc";
        }

        String searchQuery = StringUtils.hasText(q) ? q.trim() : null;

        List<User> users = userService.findBySearch(searchQuery, page, pageSize, sortBy, validSortOrder);
        long total = userService.countBySearch(searchQuery);
        int totalPages = (int) Math.ceil((double) total / pageSize);

        List<UserDto> userDtos = users.stream().map(UserController::toDto).toList();

        return new UserPageResponse(userDtos, total, page, pageSize, totalPages);
    }

    @GetMapping("/{id}")
    public UserDto get(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toDto(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@RequestBody CreateUserRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.firstName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName is required");
        }
        if (!StringUtils.hasText(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        if (!StringUtils.hasText(req.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }

        String email = req.email().trim();
        String phone = StringUtils.hasText(req.phone()) ? req.phone().trim() : null;

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
        }

        User user = new User();
        user.setFirstName(req.firstName().trim());
        user.setLastName(StringUtils.hasText(req.lastName()) ? req.lastName().trim() : null);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(req.password()));

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        if (req.email() != null) {
            if (!StringUtils.hasText(req.email())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email cannot be blank");
            }
            String email = req.email().trim();
            userRepository.findByEmailIgnoreCase(email)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                    });
            user.setEmail(email);
        }

        if (req.phone() != null) {
            if (!StringUtils.hasText(req.phone())) {
                user.setPhone(null);
            } else {
                String phone = req.phone().trim();
                userRepository.findByPhone(phone)
                        .filter(existing -> !existing.getId().equals(id))
                        .ifPresent(existing -> {
                            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
                        });
                user.setPhone(phone);
            }
        }

        if (req.firstName() != null) {
            if (!StringUtils.hasText(req.firstName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName cannot be blank");
            }
            user.setFirstName(req.firstName().trim());
        }

        if (req.lastName() != null) {
            user.setLastName(StringUtils.hasText(req.lastName()) ? req.lastName().trim() : null);
        }

        if (req.password() != null) {
            if (!StringUtils.hasText(req.password())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password cannot be blank");
            }
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
    }

    private static UserDto toDto(User u) {
        return new UserDto(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getPhone(),
                u.getIsAdmin(),
                u.getPhoneVerified(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}
