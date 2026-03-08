package com.oli.oli.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${sms.api.url:https://mdssend.in/api.php}")
    private String smsApiUrl;

    @Value("${sms.api.username:dhudaramsonsorganic}")
    private String smsUsername;

    @Value("${sms.api.key:GwVIxD9vknhy}")
    private String smsApiKey;

    @Value("${sms.api.senderid:MOBTIN}")
    private String smsSenderId;

    @Value("${sms.api.route:OTP}")
    private String smsRoute;

    private final HttpClient httpClient;

    public SmsService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean sendOtp(String mobile, String otpCode) {
        try {
            String message = String.format(
                    "Dear Customer, %s is your OTP for Login and registration. OTPs are SECRET, Do not disclose it to anyone %s",
                    otpCode, smsSenderId);

            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String encodedMobile = URLEncoder.encode(mobile, StandardCharsets.UTF_8);

            String url = String.format(
                    "%s?username=%s&apikey=%s&senderid=%s&route=%s&mobile=%s&text=%s",
                    smsApiUrl,
                    URLEncoder.encode(smsUsername, StandardCharsets.UTF_8),
                    URLEncoder.encode(smsApiKey, StandardCharsets.UTF_8),
                    URLEncoder.encode(smsSenderId, StandardCharsets.UTF_8),
                    URLEncoder.encode(smsRoute, StandardCharsets.UTF_8),
                    encodedMobile,
                    encodedMessage);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // Check if response indicates success
            // The API usually returns a response with success/error status
            String responseBody = response.body();
            
            // Log response for debugging (can be removed in production or use proper logger)
            System.out.println("SMS API Response: " + responseBody);
            
            // Check status code and response body
            if (response.statusCode() == 200 && responseBody != null) {
                // Some SMS APIs return JSON, some return text
                // Adjust this logic based on actual API response format
                return !responseBody.toLowerCase().contains("error");
            }

            return false;
        } catch (Exception e) {
            System.err.println("Error sending SMS: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}

