package com.platform.software.chat.notification.dto;

import java.util.List;

public record NotificationRequestDTO(List<String> tokens, String title, String body) {
}
