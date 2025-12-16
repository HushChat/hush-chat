package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserPublicProfileDTO;

public interface UserInfoQueryRepository {
    UserPublicProfileDTO getPublicProfile(Long id);
}
