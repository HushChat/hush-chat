package com.platform.software.chat.contactus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
public class ContactUsController {

    @PostMapping("/contact-us")
    public ResponseEntity<String> submitContactUs(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String subject = payload.get("subject");
        String message = payload.get("message");

        // Basic validation
        if (name == null || name.isBlank() ||
            email == null || email.isBlank() ||
            subject == null || subject.isBlank() ||
            message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }
        return ResponseEntity.ok("Your message has been sent. We will get back to you soon!");
    }
}