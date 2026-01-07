package com.platform.software.chat.message.tenor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MediaFormatsDto {
    private GifFormatDto gif;
    private GifFormatDto tinygif;
}
