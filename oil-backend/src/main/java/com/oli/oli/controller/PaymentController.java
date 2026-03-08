package com.oli.oli.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/payments/cashfree")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final RestTemplate restTemplate;

    @Value("${cashfree.api.url:${CASHFREE_BASE_URL:sandbox}}")
    private String cashfreeBase;

    @Value("${cashfree.app.id:${CASHFREE_APP_ID:}}")
    private String clientId;

    @Value("${cashfree.secret.key:${CASHFREE_SECRET_KEY:}}")
    private String clientSecret;

    @Value("${cashfree.api.version:2023-08-01}")
    private String apiVersion;

    public PaymentController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public record CreateOrderRequest(
            BigDecimal amount,
            String currency,
            String customerId,
            String customerName,
            String customerEmail,
            String customerPhone,
            String returnUrl,
            String orderNote) {
    }

    public record CreateOrderResponse(
            String orderId,
            String paymentSessionId,
            Object raw) {
    }

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest req) {
        if (req == null || req.amount() == null || req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }

        BigDecimal amount = req.amount().setScale(2, RoundingMode.HALF_UP);

        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Cashfree client id is not configured");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("Cashfree client secret is not configured");
        }

        String currency = (req.currency() == null || req.currency().isBlank()) ? "INR" : req.currency().trim();

        String customerId = safeCustomerId(req.customerId());

        String orderId = "ORD_" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        log.info("Cashfree createOrder request orderId={} amount={} currency={} customerId={}",
                orderId, amount, currency, customerId);

        Map<String, Object> payload = Map.of(
                "order_id", orderId,
                "order_amount", amount,
                "order_currency", currency,
                "customer_details", Map.of(
                        "customer_id", customerId,
                        "customer_name", nullToEmpty(req.customerName()),
                        "customer_email", nullToEmpty(req.customerEmail()),
                        "customer_phone", nullToEmpty(req.customerPhone())),
                "order_meta", Map.of(
                        "return_url", nullToEmpty(req.returnUrl())),
                "order_note", nullToEmpty(req.orderNote()));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-client-secret", clientSecret);
        headers.set("x-api-version", apiVersion);

        String url = normalizeBaseUrl(cashfreeBase) + "/orders";

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Map.class);
            Map body = resp.getBody();
            if (body == null) {
                return ResponseEntity.status(502).body(new CreateOrderResponse(null, null, null));
            }

            Object ps = body.get("payment_session_id");
            Object oid = body.get("order_id");
            return ResponseEntity.ok(new CreateOrderResponse(String.valueOf(oid), ps == null ? null : String.valueOf(ps), body));
        } catch (HttpStatusCodeException ex) {
            String respBody = ex.getResponseBodyAsString();
            log.warn("Cashfree createOrder failed orderId={} status={} response={}",
                    orderId, ex.getStatusCode(), respBody);
            return ResponseEntity.status(502).body(new CreateOrderResponse(null, null, Map.of(
                    "amount", amount,
                    "currency", currency,
                    "cashfree", respBody)));
        } catch (RestClientException ex) {
            log.error("Cashfree createOrder error orderId={}", orderId, ex);
            return ResponseEntity.status(502).body(new CreateOrderResponse(null, null, ex.getMessage()));
        }
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Object> getOrder(@PathVariable String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Invalid orderId");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", clientId);
        headers.set("x-client-secret", clientSecret);
        headers.set("x-api-version", apiVersion);

        String url = normalizeBaseUrl(cashfreeBase) + "/orders/" + orderId;

        try {
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (RestClientException ex) {
            return ResponseEntity.status(502).body(Map.of("error", "Failed to fetch Cashfree order", "message", ex.getMessage()));
        }
    }

    private static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "https://sandbox.cashfree.com/pg";
        }
        String v = baseUrl.trim();
        if (v.equalsIgnoreCase("sandbox")) {
            return "https://sandbox.cashfree.com/pg";
        }
        if (v.equalsIgnoreCase("production") || v.equalsIgnoreCase("prod")) {
            return "https://api.cashfree.com/pg";
        }
        if (v.endsWith("/")) {
            return v.substring(0, v.length() - 1);
        }
        return v;
    }

    private static String safeCustomerId(String raw) {
        String v = raw == null ? "" : raw.trim();
        if (!v.isBlank()) {
            v = v.replaceAll("[^A-Za-z0-9_-]", "_");
            v = v.replaceAll("_+", "_");
            v = v.replaceAll("^-+", "");
            v = v.replaceAll("^_+", "");
            v = v.replaceAll("-+$", "");
            v = v.replaceAll("_+$", "");
        }

        if (v.isBlank()) {
            v = "guest_" + UUID.randomUUID().toString().replace("-", "");
        }

        // keep it reasonably short
        if (v.length() > 64) {
            v = v.substring(0, 64);
        }
        return v;
    }

    private static String nullToEmpty(String v) {
        return v == null ? "" : v;
    }
}
