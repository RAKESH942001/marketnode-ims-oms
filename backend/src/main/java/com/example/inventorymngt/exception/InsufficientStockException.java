package com.example.inventorymngt.exception;

public class InsufficientStockException extends  RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }


}
