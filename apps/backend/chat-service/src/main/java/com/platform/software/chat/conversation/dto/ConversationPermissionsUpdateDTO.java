package com.platform.software.chat.conversation.dto;

import lombok.Data;

@Data
public class ConversationPermissionsUpdateDTO {
    private Boolean onlyAdminsCanSendMessages;
    private Boolean onlyAdminsCanAddParticipants;
    private Boolean onlyAdminsCanEditGroupInfo;
}
