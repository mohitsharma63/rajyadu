package com.oli.oli.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oli.oli.model.Otp;
import com.oli.oli.repository.OtpRepository;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    private final OtpRepository otpRepository;
    private final SmsService smsService;
    private final EmailService emailService;

    public OtpService(OtpRepository otpRepository, SmsService smsService, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.smsService = smsService;
        this.emailService = emailService;
    }

    @Transactional
    public Otp generateAndSendOtp(String phone) {
        // Clean phone number (remove spaces, dashes, etc.)
        String cleanPhone = phone.replaceAll("[^0-9+]", "");

        // Delete previous unverified OTPs for this phone
        List<Otp> existingOtps = otpRepository.findByPhoneAndVerifiedFalse(cleanPhone);
        otpRepository.deleteAll(existingOtps);

        // Generate new OTP
        String otpCode = generateOtp();

        // Create and save OTP
        Otp otp = new Otp();
        otp.setPhone(cleanPhone);
        otp.setCode(otpCode);
        otp.setVerified(false);

        Otp savedOtp = otpRepository.save(otp);

        // Send SMS
        boolean smsSent = smsService.sendOtp(cleanPhone, otpCode);
        
        if (!smsSent) {
            // If SMS failed, still return OTP for testing purposes
            // In production, you might want to throw an exception
            System.err.println("Failed to send SMS for phone: " + cleanPhone);
        }

        return savedOtp;
    }

    public boolean verifyOtp(String phone, String code) {
        String cleanPhone = phone.replaceAll("[^0-9+]", "");

        Optional<Otp> otpOpt = otpRepository.findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(cleanPhone);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();

        // Check if OTP is expired
        if (otp.isExpired()) {
            return false;
        }

        // Verify code
        if (!otp.getCode().equals(code)) {
            return false;
        }

        // Mark as verified
        otp.setVerified(true);
        otpRepository.save(otp);

        return true;
    }

    public boolean isOtpVerified(String phone) {
        String cleanPhone = phone.replaceAll("[^0-9+]", "");
        Optional<Otp> otpOpt = otpRepository.findFirstByPhoneAndVerifiedTrueOrderByCreatedAtDesc(cleanPhone);
        
        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();
        // Check if verified OTP is still valid (within expiration time)
        // For verification purposes, we consider it valid if verified within last 30 minutes
        return otp.getVerified() && !otp.isExpired();
    }

    @Transactional
    public Otp generateAndSendOtpForEmail(String email) {
        // Use email prefix to distinguish from phone OTPs
        String emailIdentifier = "email:" + email.toLowerCase().trim();

        // Delete previous unverified OTPs for this email
        List<Otp> existingOtps = otpRepository.findByPhoneAndVerifiedFalse(emailIdentifier);
        otpRepository.deleteAll(existingOtps);

        // Generate new OTP
        String otpCode = generateOtp();

        // Create and save OTP
        Otp otp = new Otp();
        otp.setPhone(emailIdentifier);
        otp.setCode(otpCode);
        otp.setVerified(false);

        Otp savedOtp = otpRepository.save(otp);

        // Send Email
        boolean emailSent = emailService.sendPasswordResetEmail(email, otpCode);
        
        if (!emailSent) {
            System.err.println("Failed to send email for: " + email);
        }

        return savedOtp;
    }

    public boolean verifyOtpForEmail(String email, String code) {
        String emailIdentifier = "email:" + email.toLowerCase().trim();

        Optional<Otp> otpOpt = otpRepository.findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(emailIdentifier);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();

        // Check if OTP is expired
        if (otp.isExpired()) {
            return false;
        }

        // Verify code
        if (!otp.getCode().equals(code)) {
            return false;
        }

        // Mark as verified
        otp.setVerified(true);
        otpRepository.save(otp);

        return true;
    }

    private String generateOtp() {
        StringBuilder otp = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}

