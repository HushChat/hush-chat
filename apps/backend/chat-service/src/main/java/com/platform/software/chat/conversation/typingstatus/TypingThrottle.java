package com.platform.software.chat.conversation.typingstatus;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TypingThrottle {
    private final Map<String, Long> lastSentMap = new ConcurrentHashMap<>();
    private static final long THROTTLE_MS = 800;

    public boolean shouldSend(String userKey) {
        long now = System.currentTimeMillis();
        return lastSentMap.merge(userKey, now,
                (oldVal, newVal) -> (now - oldVal > THROTTLE_MS) ? now : oldVal
        ) == now;
    }
}
