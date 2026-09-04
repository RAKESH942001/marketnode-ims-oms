package com.example.inventorymngt.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepo extends JpaRepository<ProductEntitiy, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ProductEntitiy p SET p.stock = p.stock - :quantity WHERE p.id = :productId AND p.stock >= :quantity")
    int deductStockIfAvailable(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ProductEntitiy p SET p.stock = p.stock + :quantity WHERE p.id = :productId")
    int restoreStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}

