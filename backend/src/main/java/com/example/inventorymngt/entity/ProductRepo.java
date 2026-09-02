package com.example.inventorymngt.entity;

import com.example.inventorymngt.entity.ProductEntitiy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<ProductEntitiy, Long> {
}
