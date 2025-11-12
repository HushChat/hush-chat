package com.platform.software.chat.notification.controller;

import com.platform.software.chat.notification.dto.DeviceTokenUpsertDTO;
import com.platform.software.chat.notification.service.ChatNotificationService;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class ChatNotificationController {

    private final ChatNotificationService chatNotificationService;

    public ChatNotificationController(ChatNotificationService chatNotificationService) {
        this.chatNotificationService = chatNotificationService;
    }

    @PostMapping("/device-token")
    public ResponseEntity<Void> saveDeviceToken(
            @AuthenticatedUser UserDetails userDetails,
            @Valid @RequestBody DeviceTokenUpsertDTO deviceTokenUpsertDTO
    ){
        chatNotificationService.saveDeviceToken(userDetails.getId(), deviceTokenUpsertDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
