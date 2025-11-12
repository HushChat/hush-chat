package com.platform.software.chat.notification.service;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.notification.repository.ChatNotificationRepository;
import com.platform.software.config.cache.CacheNames;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatNotificationUtilService {

    public String getNotificationTitle(Message message) {
        boolean isGroup = message.getConversation().getIsGroup();
        if (isGroup) {
            return message.getConversation().getName();
        }
        return message.getSender().getFirstName() + " " + message.getSender().getLastName();
    }
}
