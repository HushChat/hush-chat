package com.platform.software.chat.message.attachment.service;

import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.repository.MessageAttachmentRepository;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.exception.CustomBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageAttachmentService {
    private static final Logger logger = LoggerFactory.getLogger(MessageAttachmentService.class);

    private final MessageAttachmentRepository messageAttachmentRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public MessageAttachmentService(
        MessageAttachmentRepository messageAttachmentRepository,
        CloudPhotoHandlingService cloudPhotoHandlingService
    ) {
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

        if (signedURLResponse != null && signedURLResponse.getSignedURLs() != null && !signedURLResponse.getSignedURLs().isEmpty()) {
            List<MessageAttachment> messageAttachments = createMessageAttachments(signedURLResponse.getSignedURLs(), savedMessage);
            try {
                messageAttachmentRepository.saveAll(messageAttachments);
            } catch (Exception exception) {
                logger.error("failed to save message attachments {}", messageAttachments, exception);
                throw new CustomBadRequestException("Failed to save file(s)");
            }
        }
        return signedURLResponse;
    }

    private List<MessageAttachment> createMessageAttachments(List<SignedURLDTO> signedURLs, Message message) {
        return signedURLs.stream()
            .map(signedURL -> createMessageAttachment(signedURL, message))
            .collect(Collectors.toList());
    }

    private MessageAttachment createMessageAttachment(SignedURLDTO signedURL, Message message) {
        MessageAttachment messageAttachment = new MessageAttachment();
        messageAttachment.setMessage(message);
        messageAttachment.setOriginalFileName(signedURL.getOriginalFileName());
        messageAttachment.setIndexedFileName(signedURL.getIndexedFileName());
        return messageAttachment;
    }
}