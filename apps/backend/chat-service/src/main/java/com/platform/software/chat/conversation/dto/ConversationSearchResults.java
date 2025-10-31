package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationSearchResults {
    private List<UserDTO> users = Collections.emptyList();
    private List<ConversationDTO> chats = Collections.emptyList();
    private List<ConversationDTO> messages = Collections.emptyList();
}
