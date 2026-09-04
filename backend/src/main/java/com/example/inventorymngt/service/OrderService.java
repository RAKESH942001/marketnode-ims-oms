package com.example.inventorymngt.service;

import com.example.inventorymngt.entity.Order;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.exception.InsufficientStockException;
import com.example.inventorymngt.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ProductRepo productRepo;

    @Transactional
    public Order placeOrder(Long userId, Long productId, Integer quantity) {
        log.info("Processing order placement request: userId={}, productId={}, quantity={}", userId, productId, quantity);

        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Order quantity must be at least 1");
        }

        // 1. Find product to verify existence and snapshot details
        ProductEntitiy product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // 2. Concurrency-safe atomic stock deduction at the database level
        // UPDATE products SET stock = stock - :quantity WHERE id = :productId AND stock >= :quantity
        int rowsUpdated = productRepo.deductStockIfAvailable(productId, quantity);
        if (rowsUpdated == 0) {
            log.warn("Atomic stock deduction failed for productId={}, requestedQuantity={}. Insufficient stock or concurrent race condition.",
                    productId, quantity);
            throw new InsufficientStockException("Insufficient stock for product '" + product.getName() + "'. Requested: " + quantity);
        }

        // 3. Calculate monetary total using BigDecimal to prevent floating-point rounding errors
        BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice());
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));

        // 4. Create immutable historical order snapshot
        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(product.getId());
        order.setProductName(product.getName());
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepo.save(order);
        log.info("Order successfully created: orderId={}, userId={}, totalAmount={}",
                savedOrder.getId(), savedOrder.getUserId(), savedOrder.getTotalAmount());
        return savedOrder;
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        log.info("Processing order cancellation request: orderId={}", orderId);

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("CANCELLED".equals(order.getStatus())) {
            log.warn("Attempted duplicate cancellation for orderId={}", orderId);
            throw new IllegalStateException("Order is already cancelled");
        }

        // Atomically restore stock if product still exists in inventory
        if (order.getProductId() != null) {
            int restoredRows = productRepo.restoreStock(order.getProductId(), order.getQuantity());
            log.info("Restored {} stock items for productId={} (rows updated: {})",
                    order.getQuantity(), order.getProductId(), restoredRows);
        }

        order.setStatus("CANCELLED");
        Order cancelledOrder = orderRepo.save(order);
        log.info("Order {} successfully cancelled", orderId);
        return cancelledOrder;
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }
}
