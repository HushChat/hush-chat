package com.platform.software.chat.search;

import com.platform.software.chat.conversation.dto.ConversationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchRequestDTO {
    private String searchKeyword;
    private boolean includeMessages = true;

    @Enumerated(EnumType.STRING)
    private ConversationType conversationType;
}
