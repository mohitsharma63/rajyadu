package com.oli.oli.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.OrderEntity;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    List<OrderEntity> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
}
