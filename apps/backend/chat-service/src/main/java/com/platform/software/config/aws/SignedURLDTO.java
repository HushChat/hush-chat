package com.platform.software.config.aws;

import lombok.Data;

@Data
public class SignedURLDTO {
    private String originalFileName;
    private String indexedFileName;
    private String url;
    private String filePath;

    public SignedURLDTO(String url, String originalFileName, String indexedFileName) {
        this.url = url;
        this.originalFileName = originalFileName;
        this.indexedFileName = indexedFileName;
    }

    @Override
    public String toString() {
        return "SignedURLDTO{" +
                "originalFileName='" + originalFileName + '\'' +
                ", indexedFileName='" + indexedFileName + '\'' +
                ", url='" + url + '\'' +
                ", filePath='" + filePath + '\'' +
                '}';
    }
}