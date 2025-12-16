package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<ChatUserInfo, Long> {
}
