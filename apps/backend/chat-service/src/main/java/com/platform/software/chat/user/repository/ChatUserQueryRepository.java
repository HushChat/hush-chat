package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUser;

import java.util.List;

public interface ChatUserQueryRepository {
    List<ChatUser> getAllUsersIgnoringFilters();
}
