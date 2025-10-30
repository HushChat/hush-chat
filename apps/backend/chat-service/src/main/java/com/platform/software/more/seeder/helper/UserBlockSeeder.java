/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.user.entity.UserBlock;
import com.platform.software.chat.user.repository.UserBlockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class UserBlockSeeder {
    Logger logger = LoggerFactory.getLogger(UserSeeder.class);

    @Autowired
    private UserBlockRepository userBlockRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void seedBlockChatUsers() {
        logger.info("started seeding blocked chat users");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/users/userBlock.json");
            if (inputStream == null) {
                logger.error("userBlock.json file not found");
                return;
            }
            List<UserBlock> blockedUsers = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, UserBlock.class));

            userBlockRepository.saveAll(blockedUsers);
            logger.info("finished seeding Blocked chat users: {}", blockedUsers.size());

        } catch (IOException e) {
            logger.error("error reading userBlock.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding user block: {}", e.getMessage());
        }
    }
}