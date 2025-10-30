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

import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.common.model.ModelMapper;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageAttachmentDTO implements ModelMapper<MessageAttachment> {
    private Long id;
    private String originalFileName;
    private String indexedFileName;
    private String fileUrl;

    public MessageAttachmentDTO(MessageAttachment messageAttachment) {
        this.mapToSelf(messageAttachment);
    }

    @Override
    public MessageAttachment getModel() {
        return null;
    }

    @Override
    public MessageAttachment mapToModel(MessageAttachment dto) {
        return null;
    }

    @Override
    public void mapToSelf(MessageAttachment dto) {
        this.id = dto.getId();
        this.originalFileName = dto.getOriginalFileName();
        this.indexedFileName = dto.getIndexedFileName();
    }
}