package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserMentionEvent {
    private Message message;
    private List<ChatUser> mentionedUsers;
}
