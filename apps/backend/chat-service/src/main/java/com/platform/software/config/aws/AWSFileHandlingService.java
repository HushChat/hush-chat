package com.platform.software.config.aws;

import com.amazonaws.HttpMethod;
import com.platform.software.common.model.MediaPathEnum;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import com.platform.software.common.model.MediaSizeEnum;
import com.platform.software.exception.CustomInternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static com.platform.software.common.constants.GeneralConstants.LOCAL;

@Service
public class AWSFileHandlingService implements CloudPhotoHandlingService {
    Logger logger = LoggerFactory.getLogger(AWSFileHandlingService.class);

    @Value("${cloud.front.url}")
    private String cloudFrontUrl;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    private final S3Service s3Service;

    public AWSFileHandlingService(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    /**
     * Generates a pre-signed URL for uploading a user profile photo to AWS S3.
     * <p>
     * This method constructs the S3 object key using the provided file name from the
     * {@code imageUploadRequestDTO}, generates a signed URL for uploading the file
     * using HTTP PUT method, and returns a {@link SignedURLDTO} containing the signed URL,
     * the original file name append with an id to uniqueness, and the indexed (S3 object key) file name.
     * </p>
     *
     * @param mediaPathEnum the enum contain s3 bucket file path
     * @return a {@link SignedURLDTO} containing the signed upload URL and file information
     */
    @Override
    public SignedURLDTO getPhotoUploadSignedURL(MediaPathEnum mediaPathEnum, String fileName) {
        String objectKey = String.format(mediaPathEnum.getName(), fileName);
        String signedURL = s3Service.getPrivateBucketSignedURL(objectKey, HttpMethod.PUT);

        return new SignedURLDTO(signedURL, fileName, objectKey);
    }

    @Override
    public String getPhotoViewSignedURL(String imageIndexedName) {

        if (imageIndexedName == null) {
            return null;
        }

        if (activeProfile.equals(LOCAL)) {
            return s3Service.getPrivateBucketViewSignedURL(imageIndexedName);
        }

        return cloudFrontUrl + imageIndexedName;
    }

    @Override
    public String getPhotoViewSignedURL(MediaPathEnum mediaPathEnum, MediaSizeEnum size, String fileName) {
        if (fileName == null) {
            return null;
        }

        String imageIndexedName = String.format(mediaPathEnum.getName(), size.getName(), fileName);

        if (activeProfile.equals(LOCAL)) {
            return s3Service.getPrivateBucketViewSignedURL(imageIndexedName);
        }

        return cloudFrontUrl + imageIndexedName;
    }

    @Override
    public SignedURLResponseDTO generateSignedURLForMessageAttachmentsUpload(DocUploadRequestDTO attachmentRequestDTO, Long requestId) {
        String objectKey = String.format(MediaPathEnum.MESSAGE_ATTACHMENT.getName(), requestId);
        return getSignedURLToUpload(attachmentRequestDTO, objectKey, DocUploadRequestDTO.class);
    }

    public <T> SignedURLResponseDTO getSignedURLToUpload(T uploadedFileRequest, String folderPath, Class<T> clazz) {
        logger.info("requesting {} document upload signed url for: {} ", clazz.getSimpleName(), uploadedFileRequest);
        SignedURLResponseDTO signedURLResponseDTO = new SignedURLResponseDTO();
        try {
            Method getFileNamesMethod = clazz.getMethod("getFileNames");

            @SuppressWarnings("unchecked")
            List<String> files = (List<String>) getFileNamesMethod.invoke(uploadedFileRequest);
            
            List<SignedURLDTO> signedURLDTOS = new ArrayList<>();
            for (String f : files) {
                long timestamp = System.currentTimeMillis();
                String objectKey = folderPath + "/" + timestamp + "_" + f;
                String signedURL = s3Service.getPrivateBucketSignedURL(objectKey, HttpMethod.PUT);
                
                SignedURLDTO signedURLDTO = new SignedURLDTO(signedURL, f, objectKey);
                signedURLDTOS.add(signedURLDTO);
            }

            signedURLResponseDTO.setSignedURLs(signedURLDTOS);
        } catch (Exception e) {
            logger.error("failed to generate signed url for upload {}, {}", clazz.getSimpleName(), uploadedFileRequest, e);
            throw new CustomInternalServerErrorException("Failed to get document URL!");
        }
        return signedURLResponseDTO;
    }
}