package com.platform.software.more.seeder;

import java.io.IOException;
import com.platform.software.config.cache.RedisCacheService;
import com.platform.software.config.workspace.WorkspaceConfig;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.more.seeder.helper.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class  DBSeeder implements ApplicationListener<ApplicationReadyEvent> {
    Logger logger = LoggerFactory.getLogger(DBSeeder.class);

    @Value("${spring.datasource.global.schema}")
    private String globalSchema;

    @Autowired
    private UserSeeder userSeeder;

    @Autowired
    private UserBlockSeeder userBlockSeeder;

    @Autowired
    private ConversationParticipantSeeder conversationParticipantSeeder;

    @Autowired
    private ConversationSeeder conversationSeeder;

    @Autowired
    private MessageSeeder messageSeeder;

    @Autowired
    private MessageReactionSeeder messageReactionSeeder;

    @Autowired
    private CallLogSeeder callLogSeeder;

    @Autowired
    private CallParticipantSeeder callParticipantSeeder;

    @Autowired
    private SeederServiceConfig seederServiceConfig;

    private final SeederStatus seederStatus;

    @Autowired
    private WorkspaceSeeder workspaceSeeder;

    @Autowired
    private WorkspaceConfig workspaceConfig;

    @Autowired
    private FavouriteMessageSeeder favouriteMessageSeeder;

    @Autowired
    RedisCacheService redisCacheService;

    public DBSeeder(SeederStatus seederStatus) {
        this.seederStatus = seederStatus;
    }

    @Override
    public void onApplicationEvent(final ApplicationReadyEvent event) {

        if (!seederServiceConfig.getSeed()) {
            logger.info("seeder is switched off");
            return;
        }

        try {
            redisCacheService.clearAllCache();
            this.seedDevData();
            this.setConfigurations();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void seedDevData() throws IOException {
        /*
        Seed chat user related data
         */
        WorkspaceContext.setCurrentWorkspace(globalSchema);
        workspaceSeeder.seedWorkspace();
        workspaceSeeder.seedWorkspaceUsers();
        WorkspaceContext.clear();

        for (String schema : workspaceConfig.getWorkspaceIds().keySet()) {
            logger.info("Initializing seeding for workspace '{}'", schema);
            WorkspaceContext.setCurrentWorkspace(schema);
            seedChatData();
            WorkspaceContext.clear();
        }

        logger.info("database has been seeded");
    }

    private void seedChatData() {
        userSeeder.seedChatUsers();
        conversationSeeder.seedConversationsAndParticipants();
        messageSeeder.seedMessages();
        messageReactionSeeder.seedMessageReactions();
        favouriteMessageSeeder.seedFavouriteMessages();

        callLogSeeder.seedCallLogs();
        callParticipantSeeder.seedCallParticipants();

        userBlockSeeder.seedBlockChatUsers();

        //seed generated data
        if (!seederServiceConfig.getSeedGenerated()) {
            logger.info("Generated data seeding is switched off");
            return;
        }
        userSeeder.seedGeneratedChatUsers();
        conversationSeeder.seedGeneratedConversationsAndParticipants();
        messageSeeder.seedGeneratedMessages();
        messageReactionSeeder.seedGeneratedMessageReactions();
    }

    /**
     * setting required configurations after data seeded to the database
     */
    private void setConfigurations() {
        //setting the seeder status
        seederStatus.setSeedingComplete(true);
    }
}