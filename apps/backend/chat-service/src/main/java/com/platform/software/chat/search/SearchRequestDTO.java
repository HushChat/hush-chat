package com.platform.software.chat.search;

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
