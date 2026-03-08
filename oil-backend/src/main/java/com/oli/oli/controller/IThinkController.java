package com.oli.oli.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.oli.oli.model.OrderEntity;
import com.oli.oli.model.OrderItemEntity;

@RestController
@RequestMapping("/api/ithink")
public class IThinkController {

    private static final Logger log = LoggerFactory.getLogger(IThinkController.class);

    private final RestTemplate restTemplate;

    @Value("${logistic.api.key}")
    private String accessToken;

    @Value("${logistic.api.secret}")
    private String secretKey;

    @Value("${logistic.api.base-url:https://my.ithinklogistics.com}")
    private String baseUrl;

    @Value("${logistic.api.order-base-url:}")
    private String orderBaseUrl;

    @Value("${logistic.pickup.pincode:302002}")
    private String pickupPincode;

    @Value("${logistic.pickup.address-id:24}")
    private String pickupAddressId;

    @Value("${logistic.return.address-id:24}")
    private String returnAddressId;

    @Value("${logistic.default.logistics:delhivery}")
    private String defaultLogistics;

    @Value("${logistic.default.service-type:ground}")
    private String defaultServiceType;

    public IThinkController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public CreateOrderResponse createOrder(OrderEntity order, List<OrderItemEntity> items) {
        if (order == null) {
            return new CreateOrderResponse(false, null, null, null, "Order is required", null);
        }
        if (order.getShippingPincode() == null || order.getShippingPincode().isBlank()) {
            return new CreateOrderResponse(false, null, null, null, "Shipping pincode is required", null);
        }

        String apiBase = (orderBaseUrl == null || orderBaseUrl.isBlank()) ? baseUrl : orderBaseUrl;
        String url = normalizeBaseUrl(apiBase) + "/api_v3/order/add.json";

        Map<String, Object> shipment = new HashMap<>();
        shipment.put("waybill", "");
        shipment.put("order", order.getId());
        shipment.put("sub_order", "");
        shipment.put("order_date", java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        shipment.put("total_amount", order.getTotal() == null ? "0" : order.getTotal().toPlainString());
        shipment.put("name", order.getCustomerName() == null ? "" : order.getCustomerName());
        shipment.put("company_name", "");
        shipment.put("add", order.getShippingAddress() == null ? "" : order.getShippingAddress());
        shipment.put("add2", "");
        shipment.put("add3", "");
        shipment.put("pin", order.getShippingPincode());
        shipment.put("city", order.getShippingCity() == null ? "" : order.getShippingCity());
        shipment.put("state", order.getShippingState() == null ? "" : order.getShippingState());
        shipment.put("country", "India");
        shipment.put("phone", order.getCustomerPhone() == null ? "" : order.getCustomerPhone());
        shipment.put("alt_phone", "");
        shipment.put("email", order.getCustomerEmail() == null ? "" : order.getCustomerEmail());

        shipment.put("is_billing_same_as_shipping", "yes");
        shipment.put("billing_name", order.getCustomerName() == null ? "" : order.getCustomerName());
        shipment.put("billing_company_name", "");
        shipment.put("billing_add", order.getShippingAddress() == null ? "" : order.getShippingAddress());
        shipment.put("billing_add2", "");
        shipment.put("billing_add3", "");
        shipment.put("billing_pin", order.getShippingPincode());
        shipment.put("billing_city", order.getShippingCity() == null ? "" : order.getShippingCity());
        shipment.put("billing_state", order.getShippingState() == null ? "" : order.getShippingState());
        shipment.put("billing_country", "India");
        shipment.put("billing_phone", order.getCustomerPhone() == null ? "" : order.getCustomerPhone());
        shipment.put("billing_alt_phone", "");
        shipment.put("billing_email", order.getCustomerEmail() == null ? "" : order.getCustomerEmail());

        List<Map<String, Object>> products = new java.util.ArrayList<>();
        if (items != null) {
            for (OrderItemEntity it : items) {
                if (it == null) continue;
                Map<String, Object> p = new HashMap<>();
                p.put("product_name", it.getProductName() == null ? "" : it.getProductName());
                p.put("product_sku", it.getProductId() == null ? "" : String.valueOf(it.getProductId()));
                p.put("product_quantity", it.getQuantity() == null ? "0" : String.valueOf(it.getQuantity()));
                p.put("product_price", it.getUnitPrice() == null ? "0" : it.getUnitPrice().toPlainString());
                p.put("product_tax_rate", "0");
                p.put("product_hsn_code", "");
                p.put("product_discount", "0");
                p.put("product_img_url", "");
                products.add(p);
            }
        }
        shipment.put("products", products);

        shipment.put("shipment_length", "10");
        shipment.put("shipment_width", "10");
        shipment.put("shipment_height", "10");

        int qty = items == null ? 0 : items.stream().filter(Objects::nonNull).mapToInt(x -> x.getQuantity() == null ? 0 : x.getQuantity()).sum();
        BigDecimal weightGm = BigDecimal.valueOf(Math.max(400, qty * 500));
        BigDecimal weightKg = weightGm.divide(new BigDecimal("1000"), 3, java.math.RoundingMode.UP);
        shipment.put("weight", weightKg.stripTrailingZeros().toPlainString());

        shipment.put("shipping_charges", "0");
        shipment.put("giftwrap_charges", "0");
        shipment.put("transaction_charges", "0");
        shipment.put("total_discount", "0");
        shipment.put("first_attemp_discount", "0");

        boolean cod = order.getPaymentMethod() != null && order.getPaymentMethod().trim().equalsIgnoreCase("cod");
        shipment.put("cod_amount", cod ? (order.getTotal() == null ? "0" : order.getTotal().toPlainString()) : "0");
        shipment.put("payment_mode", cod ? "COD" : "Prepaid");

        shipment.put("reseller_name", "");
        shipment.put("eway_bill_number", "");
        shipment.put("gst_number", "");
        shipment.put("what3words", "");
        shipment.put("return_address_id", returnAddressId);

        Map<String, Object> data = new HashMap<>();
        data.put("shipments", List.of(shipment));
        data.put("pickup_address_id", pickupAddressId);
        data.put("access_token", accessToken);
        data.put("secret_key", secretKey);
        data.put("logistics", defaultLogistics);
        data.put("s_type", defaultServiceType);
        data.put("order_type", "");

        Map<String, Object> payload = Map.of("data", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            log.info("IThink createOrder request orderId={} pickupAddressId={} returnAddressId={} logistics={} s_type={} paymentMode={} weight={} url={}",
                    order.getId(), pickupAddressId, returnAddressId, defaultLogistics, defaultServiceType,
                    shipment.get("payment_mode"), shipment.get("weight"), url);
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Map.class);
            Map body = resp.getBody();
            if (body == null) {
                return new CreateOrderResponse(false, null, null, null, "Empty response from logistics provider", null);
            }

            Object statusObj = body.get("status");
            String status = statusObj == null ? "" : String.valueOf(statusObj);
            if (!Objects.equals(status, "success")) {
                String msg = extractMessage(body);
                log.warn("IThink createOrder failed orderId={} status={} message={}", order.getId(), status, msg);
                return new CreateOrderResponse(false, null, null, null, msg, body);
            }

            Object dataObj = body.get("data");
            if (dataObj instanceof Map<?, ?> m) {
                Object firstObj = m.get("1");
                if (firstObj instanceof Map<?, ?> first) {
                    String waybill = first.get("waybill") == null ? null : String.valueOf(first.get("waybill"));
                    String trackingUrl = first.get("tracking_url") == null ? null : String.valueOf(first.get("tracking_url"));
                    String logistics = first.get("logistic_name") == null ? null : String.valueOf(first.get("logistic_name"));
                    log.info("IThink createOrder success orderId={} waybill={} logistics={} trackingUrl={}", order.getId(), waybill, logistics, trackingUrl);
                    return new CreateOrderResponse(true, waybill, trackingUrl, logistics, "OK", body);
                }
            }

            log.info("IThink createOrder success orderId={} waybill=<none>", order.getId());
            return new CreateOrderResponse(true, null, null, null, "OK", body);
        } catch (RestClientException ex) {
            log.error("IThink createOrder error orderId={}", order.getId(), ex);
            return new CreateOrderResponse(false, null, null, null, "Failed to create order", ex.getMessage());
        }
    }

    private static String extractMessage(Map body) {
        if (body == null) {
            return "Failed to create order";
        }
        Object html = body.get("html_message");
        if (html != null && !String.valueOf(html).isBlank()) {
            return String.valueOf(html);
        }
        Object message = body.get("message");
        if (message != null && !String.valueOf(message).isBlank()) {
            return String.valueOf(message);
        }
        Object data = body.get("data");
        if (data instanceof Map<?, ?> m) {
            Object first = m.get("1");
            if (first instanceof Map<?, ?> fm) {
                Object remark = fm.get("remark");
                if (remark != null && !String.valueOf(remark).isBlank()) {
                    return String.valueOf(remark);
                }
            }
        }
        return "Failed to create order";
    }

    public record ServiceabilityResponse(boolean serviceable, BigDecimal shippingCharge, String message,
            Object raw) {
    }

    public record CreateOrderResponse(boolean success, String waybill, String trackingUrl, String logistics,
            String message, Object raw) {
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
            log.info("IThink serviceability request fromPincode={} toPincode={} weightKg={} cod={} productMrp={} url={}",
                    pickupPincode, deliveryPincode, weightKg, cod, productMrp, url);
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Map.class);
            Map body = resp.getBody();
            if (body == null) {
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Empty response from logistics provider", null));
            }

            Object statusObj = body.get("status");
            String status = statusObj == null ? "" : String.valueOf(statusObj);
            if (!Objects.equals(status, "success")) {
                log.info("IThink serviceability not-serviceable toPincode={} status={}", deliveryPincode, status);
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Not serviceable", body));
            }

            Object dataObj = body.get("data");
            BigDecimal minRate = extractMinRate(dataObj);
            if (minRate == null) {
                log.info("IThink serviceability rate-not-available toPincode={}", deliveryPincode);
                return ResponseEntity.ok(new ServiceabilityResponse(false, BigDecimal.ZERO, "Rate not available", body));
            }

            log.info("IThink serviceability serviceable toPincode={} minRate={}", deliveryPincode, minRate);
            return ResponseEntity.ok(new ServiceabilityResponse(true, minRate, "OK", body));
        } catch (RestClientException ex) {
            log.error("IThink serviceability error toPincode={}", deliveryPincode, ex);
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
