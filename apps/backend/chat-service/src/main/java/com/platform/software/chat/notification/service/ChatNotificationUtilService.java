package com.platform.software.chat.notification.service;

import com.platform.software.chat.message.entity.Message;
import org.springframework.stereotype.Service;


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
