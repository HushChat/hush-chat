package com.platform.software.chat.settings.service;

import com.amazonaws.HttpMethod;
import com.platform.software.chat.settings.dto.ContactUsRequestDTO;
import com.platform.software.chat.settings.entity.ContactUsAttachment;
import com.platform.software.chat.settings.entity.ContactUs;
import com.platform.software.chat.settings.repository.ContactUsRepository;
import com.platform.software.config.aws.S3Service;
import com.platform.software.config.aws.SignedURLDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final ContactUsRepository contactUsRepository;
    private final S3Service s3Service;

    public void saveContactUs(ContactUsRequestDTO request) {
        ContactUs entity = new ContactUs();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setSubject(request.getSubject());
        entity.setMessage(request.getMessage());

        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            List<ContactUsAttachment> attachmentList = request.getAttachments().stream()
                .map(item -> new ContactUsAttachment(
                    item.getOriginalFileName(),
                    item.getIndexedFileName()
                ))
                .collect(Collectors.toList());
            
            entity.setAttachments(attachmentList);
        }

        contactUsRepository.save(entity);
    }

    public Map<String, Object> generateContactUsSignedUrls(List<String> fileNames) {
        List<SignedURLDTO> signedURLs = new ArrayList<>();

        for (String originalFileName : fileNames) {
            String indexedFileName = "contact-us/" + UUID.randomUUID() + "-" + originalFileName;
            String uploadUrl = s3Service.getPrivateBucketSignedURL(indexedFileName, HttpMethod.PUT);
            signedURLs.add(new SignedURLDTO(uploadUrl, originalFileName, indexedFileName));
        }

        return Map.of("signedURLs", signedURLs);
    }
}