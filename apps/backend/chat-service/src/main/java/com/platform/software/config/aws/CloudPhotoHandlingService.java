package com.platform.software.config.aws;

import com.platform.software.common.model.MediaPathEnum;

public interface CloudPhotoHandlingService {
    SignedURLDTO getPhotoUploadSignedURL(MediaPathEnum mediaPathEnum, String fileName);

    String getPhotoViewSignedURL(String imageIndexedName);

    SignedURLResponseDTO generateSignedURLForMessageAttachmentsUpload(DocUploadRequestDTO attachmentsUploadRequestDTO, Long requestId);
}
