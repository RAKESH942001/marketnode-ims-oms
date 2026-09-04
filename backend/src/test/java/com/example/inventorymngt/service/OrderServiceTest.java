package com.example.inventorymngt.service;

import com.example.inventorymngt.entity.Order;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.exception.InsufficientStockException;
import com.example.inventorymngt.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepo orderRepo;

    @Mock
    private ProductRepo productRepo;

    @InjectMocks
    private OrderService orderService;

    private ProductEntitiy testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new ProductEntitiy();
        testProduct.setId(1L);
        testProduct.setName("Laptop Pro");
        testProduct.setCategory("Electronics");
        testProduct.setPrice(1200.00);
        testProduct.setStock(10);
    }

    @Test
    @DisplayName("placeOrder: Successfully deducts stock atomically and creates order snapshot")
    void testPlaceOrder_Success() {
        // Arrange
        Long userId = 42L;
        Long productId = 1L;
        Integer quantity = 2;

        when(productRepo.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepo.deductStockIfAvailable(productId, quantity)).thenReturn(1); // 1 row updated = atomic success
        when(orderRepo.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(101L);
            return o;
        });

        // Act
        Order createdOrder = orderService.placeOrder(userId, productId, quantity);

        // Assert
        assertNotNull(createdOrder);
        assertEquals(101L, createdOrder.getId());
        assertEquals(userId, createdOrder.getUserId());
        assertEquals(productId, createdOrder.getProductId());
        assertEquals("Laptop Pro", createdOrder.getProductName());
        assertEquals(quantity, createdOrder.getQuantity());
        assertEquals(0, BigDecimal.valueOf(1200.00).compareTo(createdOrder.getUnitPrice()));
        assertEquals(0, BigDecimal.valueOf(2400.00).compareTo(createdOrder.getTotalAmount()));

        verify(productRepo, times(1)).deductStockIfAvailable(productId, quantity);
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("placeOrder: Fails atomically when stock is insufficient and does not save order")
    void testPlaceOrder_InsufficientStock_ThrowsException() {
        // Arrange
        Long userId = 42L;
        Long productId = 1L;
        Integer quantity = 15; // Greater than available stock

        when(productRepo.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepo.deductStockIfAvailable(productId, quantity)).thenReturn(0); // 0 rows updated = race condition / no stock

        // Act & Assert
        InsufficientStockException exception = assertThrows(InsufficientStockException.class, () -> {
            orderService.placeOrder(userId, productId, quantity);
        });

        assertTrue(exception.getMessage().contains("Insufficient stock"));
        verify(orderRepo, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("placeOrder: Throws ResourceNotFoundException when product does not exist")
    void testPlaceOrder_ProductNotFound() {
        when(productRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.placeOrder(1L, 999L, 1);
        });

        verify(productRepo, never()).deductStockIfAvailable(anyLong(), anyInt());
        verify(orderRepo, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("cancelOrder: Atomically restores stock and marks order as CANCELLED")
    void testCancelOrder_Success() {
        // Arrange
        Order existingOrder = new Order();
        existingOrder.setId(201L);
        existingOrder.setUserId(42L);
        existingOrder.setProductId(1L);
        existingOrder.setProductName("Laptop Pro");
        existingOrder.setQuantity(3);
        existingOrder.setUnitPrice(BigDecimal.valueOf(1200.00));
        existingOrder.setTotalAmount(BigDecimal.valueOf(3600.00));

        when(orderRepo.findById(201L)).thenReturn(Optional.of(existingOrder));
        when(orderRepo.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order cancelledOrder = orderService.cancelOrder(201L);

        // Assert
        assertEquals("CANCELLED", cancelledOrder.getStatus());
        verify(productRepo, times(1)).restoreStock(1L, 3);
        verify(orderRepo, times(1)).save(existingOrder);
    }

    @Test
    @DisplayName("cancelOrder: Prevents double cancellation and duplicate stock restoration")
    void testCancelOrder_DoubleCancellation_ThrowsException() {
        // Arrange
        Order alreadyCancelledOrder = new Order();
        alreadyCancelledOrder.setId(201L);
        alreadyCancelledOrder.setStatus("CANCELLED");
        alreadyCancelledOrder.setProductId(1L);
        alreadyCancelledOrder.setQuantity(3);

        when(orderRepo.findById(201L)).thenReturn(Optional.of(alreadyCancelledOrder));

        // Act & Assert
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            orderService.cancelOrder(201L);
        });

        assertEquals("Order is already cancelled", ex.getMessage());
        verify(productRepo, never()).restoreStock(anyLong(), anyInt());
        verify(orderRepo, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("historicalPriceIntegrity: Order preserves snapshot price even if product price changes later")
    void testHistoricalPriceIntegrity() {
        // Arrange
        when(productRepo.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepo.deductStockIfAvailable(1L, 1)).thenReturn(1);
        when(orderRepo.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // Act: Place order when price is $1200.00
        Order order = orderService.placeOrder(42L, 1L, 1);
        assertEquals(0, BigDecimal.valueOf(1200.00).compareTo(order.getUnitPrice()));

        // Simulate subsequent admin price change on product catalog to $1500.00
        testProduct.setPrice(1500.00);

        // Assert: Order snapshot still retains original purchase price ($1200.00)
        assertEquals(0, BigDecimal.valueOf(1200.00).compareTo(order.getUnitPrice()));
        assertEquals(0, BigDecimal.valueOf(1200.00).compareTo(order.getTotalAmount()));
    }
}
