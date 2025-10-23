package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.entity.ChatUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserQueryRepository {
    Page<ChatUser> findAllUsersByCriteria(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);
}
