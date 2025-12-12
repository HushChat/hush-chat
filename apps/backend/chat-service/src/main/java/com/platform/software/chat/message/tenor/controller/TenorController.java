package com.platform.software.chat.message.tenor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.platform.software.chat.message.tenor.service.TenorService;

@RestController
@RequestMapping("/tenor")
public class TenorController {

    @Autowired
    private TenorService tenorService;

    @GetMapping("/search")
    public ResponseEntity<?> searchGifs(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Object result = tenorService.searchGifs(q, limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching GIFs: " + e.getMessage());
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedGifs(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Object result = tenorService.getFeaturedGifs(limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching GIFs: " + e.getMessage());
        }
    }
}
