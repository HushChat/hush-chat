/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
