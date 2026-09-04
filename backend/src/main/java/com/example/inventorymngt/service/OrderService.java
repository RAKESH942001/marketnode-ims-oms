package com.example.inventorymngt.service;


import com.example.inventorymngt.entity.Order;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.exception.InsufficientStockException;
import com.example.inventorymngt.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ProductRepo productRepo;

    @Transactional
    public Order placeOrder(Long userId, Long productId, Integer quantity) {

        // 1. Find product
        ProductEntitiy product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // 2. Check stock
        if (product.getStock() < quantity) {
            throw new InsufficientStockException("Insufficient stock. Available: " + product.getStock() + ", Requested: " + quantity);
        }

        // 3. Deduct stock safely
        product.setStock(product.getStock() - quantity);
        productRepo.save(product);

        // 4. Calculate total amount correctly using BigDecimal

        BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice());
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));

        // 5. Create order snapshot
        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(product.getId());
        order.setProductName(product.getName());
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);

        return orderRepo.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if ("CANCELLED".equals(order.getStatus())) {
            throw new IllegalStateException("Order is already cancelled");
        }

        // Restore stock if product still exists
        if (order.getProductId() != null) {
            productRepo.findById(order.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + order.getQuantity());
                productRepo.save(product);
            });
        }
        order.setStatus("CANCELLED");
        return orderRepo.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepo.findByUserId(userId);
    }
    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
