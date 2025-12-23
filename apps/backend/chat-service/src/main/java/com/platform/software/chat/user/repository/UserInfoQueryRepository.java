package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserProfileDTO;

public interface UserInfoQueryRepository {
    UserProfileDTO getProfileById(Long id);
}
