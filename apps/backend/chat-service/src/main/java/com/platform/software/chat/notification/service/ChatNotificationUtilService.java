package com.platform.software.chat.notification.service;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.service.MessageMentionService;
import com.platform.software.chat.user.entity.ChatUser;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatNotificationUtilService {

    private final MessageMentionService messageMentionService;

    public ChatNotificationUtilService(MessageMentionService messageMentionService) {
        this.messageMentionService = messageMentionService;
    }


    public String getNotificationTitle(Message message) {
        boolean isGroup = message.getConversation().getIsGroup();
        if (isGroup) {
            return message.getConversation().getName();
        }
        return message.getSender().getFirstName() + " " + message.getSender().getLastName();
    }


    public List<Long> getMentionedUserIds(String messageText) {

        List<ChatUser> users = messageMentionService.getMentionedUsersByUsernames(messageText);
        return users != null
                ? users.stream().map(ChatUser::getId).collect(Collectors.toList())
                : null;
    }
}
