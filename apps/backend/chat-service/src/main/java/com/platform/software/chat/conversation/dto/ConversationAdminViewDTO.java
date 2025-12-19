package com.platform.software.chat.conversation.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationAdminViewDTO {
    private Long id;
    private String name;
    private Date createdAt;
    private String description;
    private String imageIndexedName;
    private boolean isDeleted;
    private Long createdByUserId;
    private String createdByUserFirstName;
    private String createdByUserLastName;
    private String createdByUserEmail;
    private Long participantCount;
}
