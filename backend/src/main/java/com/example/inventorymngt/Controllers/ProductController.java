package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductEntitiy> list() {
        return productService.getProducts();
    }

    @GetMapping("/{id}")
    public ProductEntitiy get(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PostMapping
    public ProductEntitiy add(@RequestBody ProductEntitiy payload) {
        return productService.addProduct(payload);
    }

    @PutMapping("/{id}")
    public ProductEntitiy update(@PathVariable Long id, @RequestBody ProductEntitiy payload) {
        return productService.updateProduct(id, payload);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PatchMapping("/{id}/stock")
    public ProductEntitiy adjustStock(@PathVariable Long id, @RequestParam Integer amount) {
        return productService.adjustStock(id, amount);
    }
}
