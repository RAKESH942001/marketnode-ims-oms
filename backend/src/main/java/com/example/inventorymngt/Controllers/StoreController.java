package com.example.inventorymngt.Controllers;


import com.example.inventorymngt.dto.StoreProductResponse;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store")
public class StoreController {


    @Autowired
    private ProductRepo productRepo;

    @GetMapping("/products")
    public List<StoreProductResponse> getAllStoreProducts() {
        return productRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/products/{id}")
    public StoreProductResponse getStoreProduct(@PathVariable Long id) {
        ProductEntitiy product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }


    private StoreProductResponse convertToDto(ProductEntitiy product) {
        return new StoreProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStock() > 0
        );
    }

}
