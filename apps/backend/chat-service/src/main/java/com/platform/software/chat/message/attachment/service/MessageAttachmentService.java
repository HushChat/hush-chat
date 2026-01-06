package com.platform.software.chat.message.attachment.service;

import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.AttachmentTypeEnum;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.repository.MessageAttachmentRepository;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.common.constants.Constants;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.exception.CustomBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageAttachmentService {
    private static final Logger logger = LoggerFactory.getLogger(MessageAttachmentService.class);
    private static final String TENOR_GIF_URL_KEY = "tenor.com";
    private static final String GIF_FILE_PREFIX = "tenor_gif_";
    private static final String GIF_FILE_EXTENSION = ".gif";

    private final MessageAttachmentRepository messageAttachmentRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public MessageAttachmentService(
            MessageAttachmentRepository messageAttachmentRepository,
            CloudPhotoHandlingService cloudPhotoHandlingService) {
        this.messageAttachmentRepository = messageAttachmentRepository;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
    }

    /**
     * Upload multiple files and create attachments for a message
     *
     * @param files Array of files to upload
     */
    public SignedURLResponseDTO uploadFilesForMessage(DocUploadRequestDTO files, Message savedMessage) {
        if (files == null || files.getFileNames().isEmpty()) {
            return new SignedURLResponseDTO();
        }

        SignedURLResponseDTO signedURLResponse = cloudPhotoHandlingService
                .generateSignedURLForMessageAttachmentsUpload(files, savedMessage.getId());

        if (signedURLResponse != null && signedURLResponse.getSignedURLs() != null
                && !signedURLResponse.getSignedURLs().isEmpty()) {
            List<MessageAttachment> messageAttachments = createMessageAttachments(signedURLResponse.getSignedURLs(),
                    savedMessage);
            try {
                messageAttachmentRepository.saveAll(messageAttachments);
            } catch (Exception exception) {
                logger.error("failed to save message attachments {}", messageAttachments, exception);
                throw new CustomBadRequestException("Failed to save file(s)");
            }
        }
        return signedURLResponse;
    }

    /**
     * Generate signed URLs for message attachments without creating attachment
     * records.
     *
     * @param files          Array of files to upload
     * @param conversationId The conversation ID
     * @return SignedURLResponseDTO containing the signed URLs
     */
    public SignedURLResponseDTO generateSignedURLs(DocUploadRequestDTO files, Long conversationId) {
        if (files == null || files.getFileNames().isEmpty()) {
            return new SignedURLResponseDTO();
        }

        return cloudPhotoHandlingService
                .generateSignedURLForMessageAttachmentsUpload(files, conversationId);
    }

    /**
     * Create a GIF attachment without file upload
     * 
     * @param gifUrl  The Tenor GIF URL
     * @param message The message to attach the GIF to
     * @return The created MessageAttachment
     */
    @Transactional
    public MessageAttachment createGifAttachment(String gifUrl, Message message) {
        if (!gifUrl.isEmpty() && !gifUrl.contains(TENOR_GIF_URL_KEY)) {
            throw new CustomBadRequestException("Invalid Tenor GIF URL");
        }

        MessageAttachment gifAttachment = new MessageAttachment();
        gifAttachment.setMessage(message);
        gifAttachment.setOriginalFileName(GIF_FILE_PREFIX + UUID.randomUUID().toString() + GIF_FILE_EXTENSION);
        gifAttachment.setIndexedFileName(gifUrl);
        gifAttachment.setType(AttachmentTypeEnum.GIF);

        try {
            return messageAttachmentRepository.save(gifAttachment);
        } catch (Exception exception) {
            logger.error("failed to save GIF attachment for message {}", message.getId(), exception);
            throw new CustomBadRequestException("Failed to save GIF attachment");
        }
    }

    private List<MessageAttachment> createMessageAttachments(List<SignedURLDTO> signedURLs, Message message) {
        return signedURLs.stream()
                .map(signedURL -> createMessageAttachment(signedURL, message))
                .collect(Collectors.toList());
    }

    public MessageAttachment createMessageAttachment(SignedURLDTO signedURL, Message message) {
        MessageAttachment messageAttachment = new MessageAttachment();
        messageAttachment.setMessage(message);
        messageAttachment.setOriginalFileName(signedURL.getOriginalFileName());
        messageAttachment.setIndexedFileName(signedURL.getIndexedFileName());
        messageAttachment.setType(getAttachmentType(signedURL.getOriginalFileName()));
        return messageAttachment;
    }

    private AttachmentTypeEnum getAttachmentType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return AttachmentTypeEnum.OTHER;
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        if (Constants.IMAGE_EXTENSIONS.contains(extension))
            return AttachmentTypeEnum.IMAGE;
        if (Constants.VIDEO_EXTENSIONS.contains(extension))
            return AttachmentTypeEnum.VIDEO;
        if (Constants.AUDIO_EXTENSIONS.contains(extension))
            return AttachmentTypeEnum.AUDIO;
        if (Constants.DOCUMENT_EXTENSIONS.contains(extension))
            return AttachmentTypeEnum.DOCUMENT;

        return AttachmentTypeEnum.OTHER;
    }

    public void saveAttachment(MessageAttachment attachment) {
        try {
            messageAttachmentRepository.save(attachment);
        } catch (Exception exception) {
            logger.error("failed to save message attachment {}", attachment, exception);
            throw new CustomBadRequestException("Failed to save file");
        }
    }

    public Page<MessageAttachmentDTO> getAttachments(Long conversationId,
            AttachmentFilterCriteria attachmentFilterCriteria, Pageable pageable) {
        attachmentFilterCriteria.setConversationId(conversationId);
        Page<MessageAttachment> attachmentPage = messageAttachmentRepository.filterAttachments(attachmentFilterCriteria,
                pageable);
        Page<MessageAttachmentDTO> attachmentDTOPage = attachmentPage.map(attachment -> {
            MessageAttachmentDTO attachmentDTO = new MessageAttachmentDTO(attachment);

            if (attachment.getType() == AttachmentTypeEnum.GIF) {
                attachmentDTO.setFileUrl(attachment.getIndexedFileName());
            } else {
                String fileViewSignedURL = cloudPhotoHandlingService
                        .getPhotoViewSignedURL(attachment.getIndexedFileName());
                attachmentDTO.setFileUrl(fileViewSignedURL);
            }

            return attachmentDTO;
        });
        return attachmentDTOPage;
    }
}