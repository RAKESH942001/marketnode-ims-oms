package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.entity.Order;
import com.example.inventorymngt.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestBody(required = false) @Valid CreateOrderRequest requestBody,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer quantity) {

        Long effectiveUserId = (requestBody != null && requestBody.getUserId() != null) ? requestBody.getUserId() : userId;
        Long effectiveProductId = (requestBody != null && requestBody.getProductId() != null) ? requestBody.getProductId() : productId;
        Integer effectiveQuantity = (requestBody != null && requestBody.getQuantity() != null) ? requestBody.getQuantity() : quantity;

        if (effectiveUserId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (effectiveProductId == null) {
            throw new IllegalArgumentException("Product ID is required");
        }
        if (effectiveQuantity == null || effectiveQuantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        Order order = orderService.placeOrder(effectiveUserId, effectiveProductId, effectiveQuantity);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrdersByUser(@RequestParam Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        Order cancelledOrder = orderService.cancelOrder(id);
        return new ResponseEntity<>(cancelledOrder, HttpStatus.OK);
    }
}
