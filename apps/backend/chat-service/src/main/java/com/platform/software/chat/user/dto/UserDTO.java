package com.platform.software.chat.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.ModelMapper;
import com.platform.software.utils.CommonUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDTO implements ModelMapper<ChatUser> {

    private Long id;
    private String firstName;
    private String username;
    private String lastName;
    private String email;
    private Boolean active = false;
    private Boolean deleted = false;
    private String imageIndexedName;
    private Long conversationId;
    private String signedImageUrl;

    public UserDTO(ChatUser user) {
        this.mapToSelf(user);
    }
    
    @Override
    @JsonIgnore
    public ChatUser getModel() {
        ChatUser user = new ChatUser();
        mapToModel(user);
        return user;
    }
    
    @Override
    public ChatUser mapToModel(ChatUser dao) {
        dao.setId(this.id);
        dao.setFirstName(this.firstName);
        dao.setLastName(this.lastName);
        dao.setUsername(this.username);
        dao.setEmail(this.email);
        dao.setActive(this.active);
        dao.setDeleted(this.deleted);

        if (CommonUtils.isNotEmptyObj(this.imageIndexedName)) {
            dao.setImageIndexedName(this.imageIndexedName);
        }
        return dao;
    }
    @Override
    public void mapToSelf(ChatUser dao) {
        this.id = dao.getId();
        this.firstName = dao.getFirstName();
        this.lastName = dao.getLastName();
        this.username = dao.getUsername();
        this.email = dao.getEmail();
        this.active = dao.getActive();
        this.deleted = dao.getDeleted();

        if (CommonUtils.isNotEmptyObj(dao.getImageIndexedName())) {
            this.imageIndexedName = dao.getImageIndexedName();
        }
    }
}
