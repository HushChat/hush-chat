package com.platform.software.chat.message.tenor.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TenorGifDto {
    private String id;
    private String title;

    @JsonProperty("media_formats")
    private MediaFormatsDto mediaFormats;

    @JsonProperty("content_description")
    private String contentDescription;

    private String itemurl;
    private String url;
    private List<String> tags;
    private Double created;
}
