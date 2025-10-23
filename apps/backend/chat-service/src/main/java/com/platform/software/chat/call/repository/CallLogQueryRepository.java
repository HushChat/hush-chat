package com.platform.software.chat.call.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.call.dto.CallLogViewDTO;

public interface CallLogQueryRepository {
    Page<CallLogViewDTO> findCallLogsByParticipantUserId(Long userId, Pageable pageable);
}
