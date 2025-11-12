package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserViewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserBlockQueryRepository {
    Page<UserViewDTO> getBlockedUsersById(Pageable pageable, Long blockerId);

    boolean isUserBlocked(Long blockerId, Long blockedId);
}
