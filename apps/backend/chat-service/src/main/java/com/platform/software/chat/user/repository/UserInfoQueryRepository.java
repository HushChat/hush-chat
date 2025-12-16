package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserPublicProfile;

public interface UserInfoQueryRepository {
    UserPublicProfile getPublicProfile(Long id);
}
