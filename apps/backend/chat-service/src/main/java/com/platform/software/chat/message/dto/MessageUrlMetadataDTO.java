package com.platform.software.chat.message.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageUrlMetadataDTO {
    private String title;
    private String description;
    private String imageUrl;
    private String siteUrl;
    private String domain;
}