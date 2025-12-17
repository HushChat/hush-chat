package com.platform.software.chat.notification.dto;

import java.util.List;
import java.util.Map;

public record NotificationRequestDTO(List<String> tokens, String title, String body, Map<String, String> data) {
}
