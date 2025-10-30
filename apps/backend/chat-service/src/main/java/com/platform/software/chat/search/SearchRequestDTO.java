package com.platform.software.chat.search;

import com.platform.software.chat.message.dto.MessageSearchRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchRequestDTO {
    private String searchKeyword;
    private boolean includeMessages = true;
}
