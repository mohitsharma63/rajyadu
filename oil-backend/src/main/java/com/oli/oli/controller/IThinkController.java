package com.oli.oli.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/ithink")
public class IThinkController {

    private final RestTemplate restTemplate;

    @Value("${logistic.api.key}")
    private String accessToken;

    @Value("${logistic.api.secret}")
    private String secretKey;

    @Value("${logistic.api.base-url:https://my.ithinklogistics.com}")
    private String baseUrl;

    @Value("${logistic.pickup.pincode:302002}")
    private String pickupPincode;

    public IThinkController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public record ServiceabilityResponse(boolean serviceable, BigDecimal shippingCharge, String message,
            Object raw) {
    }

    @GetMapping("/serviceability")
    public ResponseEntity<ServiceabilityResponse> serviceability(
            @RequestParam("deliveryPincode") String deliveryPincode,
            @RequestParam(value = "weight", defaultValue = "0.5") BigDecimal weightKg,
            @RequestParam(value = "cod", defaultValue = "false") boolean cod,
            @RequestParam(value = "productMrp", defaultValue = "0") BigDecimal productMrp) {

        if (deliveryPincode == null || !deliveryPincode.matches("^[1-9]\\d{5}$")) {
            throw new IllegalArgumentException("Invalid deliveryPincode");
        }
        if (weightKg == null || weightKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid weight");
        }
        if (productMrp == null || productMrp.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Invalid productMrp");
        }

        String url = normalizeBaseUrl(baseUrl) + "/api_v3/rate/check.json";

        Map<String, Object> data = new HashMap<>();
        data.put("from_pincode", pickupPincode);
        data.put("to_pincode", deliveryPincode);
        data.put("shipping_length_cms", "10");
        data.put("shipping_width_cms", "10");
        data.put("shipping_height_cms", "10");
        data.put("shipping_weight_kg", weightKg.toPlainString());
        data.put("order_type", "forward");
        data.put("payment_method", cod ? "cod" : "prepaid");
        data.put("product_mrp", productMrp.toPlainString());
        data.put("access_token", accessToken);
        data.put("secret_key", secretKey);

        Map<String, Object> payload = Map.of("data", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Map.class);
            Map body = resp.getBody();
            if (body == null) {
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Empty response from logistics provider", null));
            }

            Object statusObj = body.get("status");
            String status = statusObj == null ? "" : String.valueOf(statusObj);
            if (!Objects.equals(status, "success")) {
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Not serviceable", body));
            }

            Object dataObj = body.get("data");
            BigDecimal minRate = extractMinRate(dataObj);
            if (minRate == null) {
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Rate not available", body));
            }

            return ResponseEntity.ok(new ServiceabilityResponse(true, minRate, "OK", body));
        } catch (RestClientException ex) {
            return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Failed to fetch rate", ex.getMessage()));
        }
    }

    private static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "https://my.ithinklogistics.com";
        }
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }

    private static BigDecimal extractMinRate(Object dataObj) {
        if (!(dataObj instanceof List<?> list)) {
            return null;
        }

        BigDecimal min = null;
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> m)) {
                continue;
            }
            Object rateObj = m.get("rate");
            if (rateObj == null) {
                continue;
            }

            try {
                BigDecimal rate = new BigDecimal(String.valueOf(rateObj));
                if (min == null || rate.compareTo(min) < 0) {
                    min = rate;
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return min;
    }
}
