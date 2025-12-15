package com.platform.software.chat.settings.controller;

import com.platform.software.chat.settings.dto.ContactUsRequestDTO;
import com.platform.software.chat.settings.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings") 
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @PostMapping("/contact-us")
    public ResponseEntity<String> sendContactUs(@Valid @RequestBody ContactUsRequestDTO contactUsRequestDTO) {
        settingsService.saveContactUs(contactUsRequestDTO);
        return ResponseEntity.ok("Your message has been sent. We will get back to you soon!");
    }

    @PostMapping("/contact-us/signed-urls") 
    public ResponseEntity<Map<String, Object>> getContactUsSignedUrls(@RequestBody Map<String, List<String>> payload) {
        List<String> fileNames = payload.get("fileNames");
        return ResponseEntity.ok(settingsService.generateContactUsSignedUrls(fileNames));
    }
}