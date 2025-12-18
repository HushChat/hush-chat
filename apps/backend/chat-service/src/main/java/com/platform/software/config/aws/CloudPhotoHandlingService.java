package com.platform.software.config.aws;

import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.common.model.MediaSizeEnum;

public interface CloudPhotoHandlingService {
    SignedURLDTO getPhotoUploadSignedURL(MediaPathEnum mediaPathEnum, String fileName);
    String getPhotoViewSignedURL(String imageIndexedName);
    String getPhotoViewSignedURL(MediaPathEnum mediaPathEnum, MediaSizeEnum size, String fileName);

    SignedURLResponseDTO generateSignedURLForMessageAttachmentsUpload(DocUploadRequestDTO attachmentsUploadRequestDTO, Long requestId);
}
