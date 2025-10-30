package com.platform.software.chat.message.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Getter
@NoArgsConstructor
public class MessageSearchRequestDTO {
    private String searchKeyword;
}
