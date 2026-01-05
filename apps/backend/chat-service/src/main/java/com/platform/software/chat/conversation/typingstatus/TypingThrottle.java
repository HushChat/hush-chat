package com.platform.software.chat.conversation.typingstatus;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class TypingThrottle {

    private static final long THROTTLE_MS = 2500; // 2.5 seconds

    private final Cache<String, Long> lastSentCache =
            CacheBuilder.newBuilder()
                    .expireAfterWrite(5, TimeUnit.SECONDS)
                    .maximumSize(100_000)
                    .build();

    public boolean shouldSend(String userKey, long conversationId) {
        String key = userKey + ":" + conversationId;
        long now = System.currentTimeMillis();

        Long lastSent = lastSentCache.getIfPresent(key);

        if (lastSent == null || now - lastSent > THROTTLE_MS) {
            lastSentCache.put(key, now);
            return true;
        }

        return false;
    }
}
