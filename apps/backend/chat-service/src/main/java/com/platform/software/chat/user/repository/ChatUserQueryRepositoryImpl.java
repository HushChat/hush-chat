package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.List;

public class ChatUserQueryRepositoryImpl implements ChatUserQueryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<ChatUser> getAllUsersIgnoringFilters() {
        Query query = entityManager.createNativeQuery(
            "SELECT * FROM chat_user", ChatUser.class);
        return query.getResultList();
    }
}
