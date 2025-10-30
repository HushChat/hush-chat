package com.platform.software.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Setter;

@Setter
@JsonIgnoreProperties(ignoreUnknown = true) // Also ignoring unknown fields in the pageable details
public class PageableResponse {
    private int pageNumber;
    private int pageSize;
    private boolean sorted;

    @JsonProperty("pageNumber")
    public int getPageNumber() {
        return pageNumber;
    }

    @JsonProperty("pageSize")
    public int getPageSize() {
        return pageSize;
    }

    @JsonProperty("sorted")
    public boolean isSorted() {
        return sorted;
    }
}