package com.oli.oli.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendPasswordResetEmail(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset - OIL");
            message.setText(buildPasswordResetEmailBody(resetCode));
            
            mailSender.send(message);
            
            System.out.println("Password reset email sent to: " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String buildPasswordResetEmailBody(String resetCode) {
        return String.format(
            "Dear Customer,\n\n" +
            "%s is your OTP for password reset.\n\n" +
            "OTPs are SECRET. Do not disclose it to anyone.\n\n" +
            "If you did not request this password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "OIL Team",
            resetCode
        );
    }
}

