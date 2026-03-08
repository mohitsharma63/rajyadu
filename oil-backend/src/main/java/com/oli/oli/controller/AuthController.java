package com.oli.oli.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.UserDto;
import com.oli.oli.model.User;
import com.oli.oli.repository.UserRepository;
import com.oli.oli.service.OtpService;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String password,
            String confirmPassword
    ) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String message, UserDto user) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest req) {
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
        if (req.confirmPassword() != null && !req.password().equals(req.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password and confirmPassword must match");
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
        
        // Check if phone was verified via OTP
        if (phone != null) {
            boolean isPhoneVerified = otpService.isOtpVerified(phone);
            user.setPhoneVerified(isPhoneVerified);
        }

        User saved = userRepository.save(user);

        UserDto dto = new UserDto(
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getIsAdmin(),
                saved.getPhoneVerified(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );

        return new AuthResponse("Registered successfully", dto);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
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

        return new AuthResponse("Login successful", dto);
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ForgotPasswordResponse(String message) {
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }

        String email = req.email().trim();

        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        
        // Always return success message for security (don't reveal if email exists)
        // Send email with OTP only if user exists
        if (userOpt.isPresent()) {
            try {
                otpService.generateAndSendOtpForEmail(email);
            } catch (Exception e) {
                // Log error but don't reveal to user (security)
                System.err.println("Failed to send password reset email: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return new ForgotPasswordResponse("If an account exists with this email, a password reset link has been sent.");
    }

    public record SendOtpRequest(String phone) {
    }

    public record SendOtpResponse(String message, boolean success) {
    }

    @PostMapping("/send-otp")
    public SendOtpResponse sendOtp(@RequestBody SendOtpRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone is required");
        }

        String phone = req.phone().trim();

        // Validate phone number format (basic validation)
        String cleanPhone = phone.replaceAll("[^0-9+]", "");
        if (cleanPhone.length() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid phone number");
        }

        try {
            otpService.generateAndSendOtp(phone);
            return new SendOtpResponse("OTP sent successfully to " + phone, true);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP: " + e.getMessage());
        }
    }

    public record VerifyOtpRequest(String phone, String code) {
    }

    public record VerifyOtpResponse(String message, boolean success) {
    }

    @PostMapping("/verify-otp")
    public VerifyOtpResponse verifyOtp(@RequestBody VerifyOtpRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone is required");
        }
        if (!StringUtils.hasText(req.code())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code is required");
        }

        String phone = req.phone().trim();
        String code = req.code().trim();

        boolean isValid = otpService.verifyOtp(phone, code);

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Update user phone verification status if user exists
        Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPhoneVerified(true);
            userRepository.save(user);
        }

        return new VerifyOtpResponse("OTP verified successfully", true);
    }

    public record ForgotPasswordByPhoneRequest(String phone) {
    }

    public record ForgotPasswordByPhoneResponse(String message, boolean success) {
    }

    @PostMapping("/forgot-password-by-phone")
    public ForgotPasswordByPhoneResponse forgotPasswordByPhone(@RequestBody ForgotPasswordByPhoneRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone is required");
        }

        String phone = req.phone().trim();
        String cleanPhone = phone.replaceAll("[^0-9+]", "");

        // Check if user exists with this phone
        Optional<User> userOpt = userRepository.findByPhone(cleanPhone);
        
        // Always return success message for security (don't reveal if phone exists)
        // But only send OTP if user exists
        if (userOpt.isPresent()) {
            try {
                otpService.generateAndSendOtp(phone);
                return new ForgotPasswordByPhoneResponse("If an account exists with this phone number, an OTP has been sent.", true);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP: " + e.getMessage());
            }
        }
        
        // Return success even if user doesn't exist (security)
        return new ForgotPasswordByPhoneResponse("If an account exists with this phone number, an OTP has been sent.", true);
    }

    public record ResetPasswordRequest(String phone, String otpCode, String newPassword, String confirmPassword) {
    }

    public record ResetPasswordResponse(String message, boolean success) {
    }

    @PostMapping("/reset-password")
    public ResetPasswordResponse resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone is required");
        }
        if (!StringUtils.hasText(req.otpCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "otpCode is required");
        }
        if (!StringUtils.hasText(req.newPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "newPassword is required");
        }
        if (req.confirmPassword() != null && !req.newPassword().equals(req.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "newPassword and confirmPassword must match");
        }

        String phone = req.phone().trim();
        String otpCode = req.otpCode().trim();
        String newPassword = req.newPassword().trim();

        // Verify OTP first
        boolean isOtpValid = otpService.verifyOtp(phone, otpCode);
        if (!isOtpValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Find user by phone
        String cleanPhone = phone.replaceAll("[^0-9+]", "");
        User user = userRepository.findByPhone(cleanPhone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new ResetPasswordResponse("Password reset successfully", true);
    }
}
