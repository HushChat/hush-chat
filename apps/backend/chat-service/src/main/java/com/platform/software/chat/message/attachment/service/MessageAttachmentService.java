/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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