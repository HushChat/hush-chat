package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUserInfo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<ChatUserInfo, Long>, UserInfoQueryRepository {
    List<ChatUserInfo> findAllByChatUserIdIn(List<Long> UserIds);
    Optional<ChatUserInfo> findByChatUserId(Long UserIds);
}
