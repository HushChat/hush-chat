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
