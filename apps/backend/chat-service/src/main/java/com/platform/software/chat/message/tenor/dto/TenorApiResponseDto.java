package com.platform.software.chat.message.tenor.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TenorApiResponseDto {
    private List<TenorGifDto> results;
    private String next;
}
