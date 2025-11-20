package com.platform.software.chat.presence.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class PresenceService {

    private final Cache<String, Long> onlineUsers;

    public PresenceService(){
        this.onlineUsers = CacheBuilder.newBuilder()
                .expireAfterWrite(40, TimeUnit.SECONDS)
                .concurrencyLevel(Runtime.getRuntime().availableProcessors())
                .build();
    }

    public void setOnline(String sessionKey){
        onlineUsers.put(sessionKey, System.currentTimeMillis());
    }

    public void setOffline(String sessionKey) {
        onlineUsers.invalidate(sessionKey);
    }

    public boolean isOnline(String sessionKey) {
        return onlineUsers.getIfPresent(sessionKey) != null;
    }
}
