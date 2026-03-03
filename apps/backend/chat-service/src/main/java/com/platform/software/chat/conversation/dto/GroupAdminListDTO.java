package com.platform.software.chat.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupAdminListDTO {
    private Long id;
    private String name;
    private String imageIndexedName;
    private String signedImageUrl;
    private Boolean disabled;
}
