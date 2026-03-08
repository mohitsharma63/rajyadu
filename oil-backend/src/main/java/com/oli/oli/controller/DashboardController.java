package com.oli.oli.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oli.oli.repository.ProductRepository;
import com.oli.oli.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public DashboardController(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Instant oneMonthAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        // Count total products
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.count(); // Assuming all products are active, adjust if you have status field

        // Count total users/customers
        long totalCustomers = userRepository.count();
        long newCustomersThisMonth = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        // Revenue calculation (if you have orders, calculate from orders)
        // For now, return 0 as placeholder
        BigDecimal revenue = BigDecimal.ZERO;
        long pendingOrders = 0; // Placeholder - implement when you have Order model

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenue", revenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("activeProducts", activeProducts);
        stats.put("newCustomers", newCustomersThisMonth);
        stats.put("totalProducts", totalProducts);
        stats.put("totalCustomers", totalCustomers);

        return stats;
    }

    @GetMapping("/recent-orders")
    public Map<String, Object> getRecentOrders() {
        // Placeholder - implement when you have Order model
        Map<String, Object> response = new HashMap<>();
        response.put("orders", new java.util.ArrayList<>());
        return response;
    }

    @GetMapping("/sales-chart")
    public Map<String, Object> getSalesChart() {
        // Generate last 7 days data
        Map<String, Object> chartData = new HashMap<>();
        java.util.List<Map<String, Object>> data = new java.util.ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            Instant date = Instant.now().minus(i, ChronoUnit.DAYS);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString().substring(0, 10)); // YYYY-MM-DD format
            dayData.put("sales", 0); // Placeholder - implement when you have Order model
            data.add(dayData);
        }
        
        chartData.put("data", data);
        return chartData;
    }

    @GetMapping("/product-stats")
    public Map<String, Object> getProductStats() {
        long totalProducts = productRepository.count();
        long inStockProducts = productRepository.findAll().stream()
                .filter(p -> p.isInStock())
                .count();
        long outOfStockProducts = totalProducts - inStockProducts;

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", totalProducts);
        stats.put("inStock", inStockProducts);
        stats.put("outOfStock", outOfStockProducts);
        
        return stats;
    }
}

