package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.ConversationReportReasonEnum;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ConversationReportRequestDTO {
    private ConversationReportReasonEnum reason;
}
