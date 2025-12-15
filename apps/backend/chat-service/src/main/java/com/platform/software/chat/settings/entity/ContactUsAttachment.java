package com.platform.software.chat.settings.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class ContactUsAttachment {

    private String originalFileName;

    private String indexedFileName;
}