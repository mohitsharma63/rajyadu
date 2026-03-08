package com.oli.oli.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.model.OrderEntity;
import com.oli.oli.model.OrderItemEntity;
import com.oli.oli.repository.OrderItemRepository;
import com.oli.oli.repository.OrderRepository;

@RestController
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final IThinkController iThinkController;

    public OrderController(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
            IThinkController iThinkController) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.iThinkController = iThinkController;
    }

    public record OrderItemDto(Long productId, String productName, String variant, Integer quantity, BigDecimal unitPrice) {
    }

    public record CreateOrderRequest(
            String id,
            String customerName,
            String customerEmail,
            String customerPhone,
            String shippingAddress,
            String shippingCity,
            String shippingState,
            String shippingPincode,
            BigDecimal subtotal,
            BigDecimal shipping,
            BigDecimal total,
            String paymentMethod,
            String paymentStatus,
            String cashfreeOrderId,
            String status,
            List<OrderItemDto> items) {
    }

    public record OrderResponse(
            String id,
            Instant createdAt,
            String customerName,
            String customerEmail,
            String customerPhone,
            String shippingAddress,
            String shippingCity,
            String shippingState,
            String shippingPincode,
            BigDecimal subtotal,
            BigDecimal shipping,
            BigDecimal total,
            String paymentMethod,
            String paymentStatus,
            String cashfreeOrderId,
            String deliveryProvider,
            String trackingId,
            String trackingUrl,
            String status,
            List<OrderItemDto> items) {
    }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OrderResponse create(@RequestBody CreateOrderRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.customerName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "customerName is required");
        }
        if (!StringUtils.hasText(req.customerEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "customerEmail is required");
        }
        if (req.total() == null || req.total().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "total is required");
        }

        String id = StringUtils.hasText(req.id()) ? req.id().trim()
                : ("ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase());

        OrderEntity o = new OrderEntity();
        o.setId(id);
        o.setCustomerName(req.customerName().trim());
        o.setCustomerEmail(req.customerEmail().trim());
        o.setCustomerPhone(StringUtils.hasText(req.customerPhone()) ? req.customerPhone().trim() : null);
        o.setShippingAddress(StringUtils.hasText(req.shippingAddress()) ? req.shippingAddress().trim() : null);
        o.setShippingCity(StringUtils.hasText(req.shippingCity()) ? req.shippingCity().trim() : null);
        o.setShippingState(StringUtils.hasText(req.shippingState()) ? req.shippingState().trim() : null);
        o.setShippingPincode(StringUtils.hasText(req.shippingPincode()) ? req.shippingPincode().trim() : null);
        o.setSubtotal(req.subtotal() == null ? BigDecimal.ZERO : req.subtotal());
        o.setShipping(req.shipping() == null ? BigDecimal.ZERO : req.shipping());
        o.setTotal(req.total());
        o.setPaymentMethod(StringUtils.hasText(req.paymentMethod()) ? req.paymentMethod().trim() : null);
        o.setPaymentStatus(StringUtils.hasText(req.paymentStatus()) ? req.paymentStatus().trim() : null);
        o.setCashfreeOrderId(StringUtils.hasText(req.cashfreeOrderId()) ? req.cashfreeOrderId().trim() : null);
        o.setStatus(StringUtils.hasText(req.status()) ? req.status().trim() : null);

        if (!StringUtils.hasText(o.getDeliveryProvider())) {
            o.setDeliveryProvider(resolveDeliveryProvider(req));
        }

        OrderEntity saved = orderRepository.save(o);

        if (req.items() != null) {
            for (OrderItemDto it : req.items()) {
                if (it == null) continue;
                if (it.quantity() == null || it.quantity() <= 0) continue;
                OrderItemEntity e = new OrderItemEntity();
                e.setOrder(saved);
                e.setProductId(it.productId());
                e.setProductName(it.productName());
                e.setVariant(it.variant());
                e.setQuantity(it.quantity());
                e.setUnitPrice(it.unitPrice());
                orderItemRepository.save(e);
            }
        }

        if (StringUtils.hasText(saved.getDeliveryProvider())
                && saved.getDeliveryProvider().trim().equalsIgnoreCase("IThink")
                && !StringUtils.hasText(saved.getTrackingId())) {
            try {
                List<OrderItemEntity> itemEntities = orderItemRepository.findByOrder_Id(saved.getId());
                var created = iThinkController.createOrder(saved, itemEntities);
                if (created == null || !created.success()) {
                    String msg = (created != null && StringUtils.hasText(created.message()))
                            ? created.message().trim()
                            : "Failed to create shipment with logistics provider";
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, msg);
                }

                if (StringUtils.hasText(created.waybill())) {
                    saved.setTrackingId(created.waybill().trim());
                }
                if (StringUtils.hasText(created.trackingUrl())) {
                    saved.setTrackingUrl(created.trackingUrl().trim());
                }
                if (!StringUtils.hasText(saved.getTrackingId()) && !StringUtils.hasText(saved.getTrackingUrl())
                        && StringUtils.hasText(created.message())) {
                    saved.setTrackingUrl(created.message().trim());
                }

                saved = orderRepository.save(saved);
            } catch (ResponseStatusException ex) {
                log.warn("IThink order creation failed for orderId={}: {}", saved.getId(), ex.getReason());
                throw ex;
            } catch (RuntimeException ex) {
                log.error("IThink order creation error for orderId={}", saved.getId(), ex);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Failed to create shipment with logistics provider");
            }
        }

        List<OrderItemDto> items = orderItemRepository.findByOrder_Id(saved.getId()).stream()
                .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                .toList();

        return toResponse(saved, items);
    }

    private String resolveDeliveryProvider(CreateOrderRequest req) {
        if (req == null) {
            return "Manual";
        }

        String pincode = StringUtils.hasText(req.shippingPincode()) ? req.shippingPincode().trim() : null;
        if (!StringUtils.hasText(pincode)) {
            return "Manual";
        }

        boolean cod = StringUtils.hasText(req.paymentMethod()) && req.paymentMethod().trim().equalsIgnoreCase("cod");
        BigDecimal productMrp = req.subtotal() == null ? BigDecimal.ZERO : req.subtotal();

        try {
            var resp = iThinkController.serviceability(pincode, new BigDecimal("0.5"), cod, productMrp);
            var body = resp == null ? null : resp.getBody();
            if (body != null && body.serviceable()) {
                return "IThink";
            }
            return "Manual";
        } catch (RuntimeException ex) {
            return "Manual";
        }
    }

    @GetMapping("/api/orders")
    public List<OrderResponse> list(@RequestParam(value = "email", required = false) String email) {
        if (StringUtils.hasText(email)) {
            return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim()).stream()
                    .map(o -> toResponse(o, orderItemRepository.findByOrder_Id(o.getId()).stream()
                            .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                            .toList()))
                    .toList();
        }

        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(o -> toResponse(o, orderItemRepository.findByOrder_Id(o.getId()).stream()
                        .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                        .toList()))
                .toList();
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse get(@PathVariable String id) {
        OrderEntity o = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        List<OrderItemDto> items = orderItemRepository.findByOrder_Id(o.getId()).stream()
                .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                .toList();
        return toResponse(o, items);
    }

    public record UpdateStatusRequest(String status, String paymentStatus, String deliveryProvider, String trackingId,
            String trackingUrl) {
    }

    @PatchMapping("/api/admin/orders/{id}")
    public OrderResponse updateStatus(@PathVariable String id, @RequestBody UpdateStatusRequest req) {
        OrderEntity o = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (req != null) {
            if (StringUtils.hasText(req.status())) {
                o.setStatus(req.status().trim());
            }
            if (StringUtils.hasText(req.paymentStatus())) {
                o.setPaymentStatus(req.paymentStatus().trim());
            }
            if (StringUtils.hasText(req.deliveryProvider())) {
                o.setDeliveryProvider(req.deliveryProvider().trim());
            }
            if (StringUtils.hasText(req.trackingId())) {
                o.setTrackingId(req.trackingId().trim());
            }
            if (StringUtils.hasText(req.trackingUrl())) {
                o.setTrackingUrl(req.trackingUrl().trim());
            }
        }

        if (StringUtils.hasText(o.getDeliveryProvider())
                && o.getDeliveryProvider().trim().equalsIgnoreCase("IThink")
                && !StringUtils.hasText(o.getTrackingId())) {
            try {
                List<OrderItemEntity> items = orderItemRepository.findByOrder_Id(o.getId());
                var created = iThinkController.createOrder(o, items);
                if (created != null && created.success()) {
                    if (StringUtils.hasText(created.waybill())) {
                        o.setTrackingId(created.waybill().trim());
                    }
                    if (StringUtils.hasText(created.trackingUrl())) {
                        o.setTrackingUrl(created.trackingUrl().trim());
                    }
                    if (!StringUtils.hasText(o.getTrackingId()) && !StringUtils.hasText(o.getTrackingUrl())
                            && StringUtils.hasText(created.message())) {
                        o.setTrackingUrl(created.message().trim());
                    }
                } else {
                    if (!StringUtils.hasText(o.getTrackingUrl()) && created != null && StringUtils.hasText(created.message())) {
                        o.setTrackingUrl(created.message().trim());
                    }
                }
            } catch (RuntimeException ignored) {
            }
        }

        OrderEntity saved = orderRepository.save(o);
        List<OrderItemDto> items = orderItemRepository.findByOrder_Id(saved.getId()).stream()
                .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                .toList();
        return toResponse(saved, items);
    }

    @GetMapping("/api/admin/orders")
    public List<OrderResponse> adminList() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(o -> toResponse(o, orderItemRepository.findByOrder_Id(o.getId()).stream()
                        .map(x -> new OrderItemDto(x.getProductId(), x.getProductName(), x.getVariant(), x.getQuantity(), x.getUnitPrice()))
                        .toList()))
                .toList();
    }

    private static OrderResponse toResponse(OrderEntity o, List<OrderItemDto> items) {
        return new OrderResponse(
                o.getId(),
                o.getCreatedAt(),
                o.getCustomerName(),
                o.getCustomerEmail(),
                o.getCustomerPhone(),
                o.getShippingAddress(),
                o.getShippingCity(),
                o.getShippingState(),
                o.getShippingPincode(),
                o.getSubtotal(),
                o.getShipping(),
                o.getTotal(),
                o.getPaymentMethod(),
                o.getPaymentStatus(),
                o.getCashfreeOrderId(),
                o.getDeliveryProvider(),
                o.getTrackingId(),
                o.getTrackingUrl(),
                o.getStatus(),
                items);
    }
}
