package com.platform.software.chat.conversation.typingstatus;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TypingThrottle {
    private final Map<String, Long> lastSentMap = new ConcurrentHashMap<>();
    private static final long THROTTLE_MS = 2500; // 2.5 seconds

    public boolean shouldSend(String userKey, long conversationId) {
        String key = userKey + ":" + conversationId;
        long now = System.currentTimeMillis();
        return lastSentMap.merge(key, now,
                (oldVal, newVal) -> (now - oldVal > THROTTLE_MS) ? now : oldVal
        ) == now;
    }
}