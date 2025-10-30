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

package com.platform.software.chat.call.dto;

import com.platform.software.chat.call.entity.CallStatusEnum;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Getter;
import lombok.Setter;
import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
public class CallLogViewDTO {
    private Long callLogId;
    private Long conversationId;
    private UserViewDTO initiator;
    private Boolean isVideo;
    private CallStatusEnum status;
    private ZonedDateTime callStartedAt;
    private ZonedDateTime callEndedAt;
    private List<CallParticipantViewDTO> participants;

    public CallLogViewDTO(
        Long callLogId, 
        Long conversationId,
        UserViewDTO initiator,
        Boolean isVideo,
        CallStatusEnum callStatusEnum,
        ZonedDateTime callStartedAt,
        ZonedDateTime callEndedAt
    ) {
        this.callLogId = callLogId;
        this.conversationId = conversationId;
        this.initiator = initiator;
        this.isVideo = isVideo;
        this.status = callStatusEnum;
        this.callStartedAt = callStartedAt;
        this.callEndedAt = callEndedAt;
    }
}
