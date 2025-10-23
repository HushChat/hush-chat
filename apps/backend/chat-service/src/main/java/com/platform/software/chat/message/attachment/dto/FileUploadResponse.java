package com.platform.software.chat.message.attachment.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileUploadResponse {
    private Long attachmentId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String status;
    private String errorMessage;

    public FileUploadResponse(Long attachmentId, String fileName, String fileUrl, String fileType, Long fileSize, String status) {
        this.attachmentId = attachmentId;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.status = status;
    }

    public FileUploadResponse(String fileName, String status, String errorMessage) {
        this.fileName = fileName;
        this.status = status;
        this.errorMessage = errorMessage;
    }
}
