package com.platform.software.chat.settings.controller;


import com.platform.software.chat.settings.dto.ContactUsRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/settings")
public class SettingsController {
    @PostMapping("/contact-us")
    public ResponseEntity<String> sendContactUsMessage(@RequestBody ContactUsRequestDTO contactUsRequestDTO) {
        // TODO: hook this into your service later
        return ResponseEntity.ok("Your message has been sent. We will get back to you soon!");
    }
}

