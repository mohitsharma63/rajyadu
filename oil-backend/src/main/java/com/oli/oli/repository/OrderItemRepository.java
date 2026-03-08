package com.oli.oli.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.OrderItemEntity;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrder_Id(String orderId);
}
