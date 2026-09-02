package com.example.inventorymngt.service;

import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<ProductEntitiy> getProducts() {
        return productRepo.findAll();
    }

    public ProductEntitiy getProduct(Long id) {
        return productRepo.findById(id).orElseThrow();
    }

    public ProductEntitiy addProduct(ProductEntitiy product) {
        return productRepo.save(product);
    }

    public ProductEntitiy updateProduct(Long id, ProductEntitiy product) {
        ProductEntitiy existing = productRepo.findById(id).orElseThrow();
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setCategory(product.getCategory());
        existing.setPrice(product.getPrice());
        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public ProductEntitiy adjustStock(Long id, Integer amount) {
        ProductEntitiy product = productRepo.findById(id).orElseThrow();
        product.setStock(product.getStock() + amount);
        return productRepo.save(product);
    }
}
