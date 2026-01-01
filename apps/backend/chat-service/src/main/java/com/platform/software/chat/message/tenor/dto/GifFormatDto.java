package com.platform.software.chat.message.tenor.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GifFormatDto {
    private String url;
    private Double duration;
    private List<Integer> dims;
    private Integer size;
}
