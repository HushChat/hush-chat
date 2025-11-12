package com.platform.software.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;


@Component
public class FirebaseInitializer {

    Logger logger = LoggerFactory.getLogger(FirebaseInitializer.class);

    @Value("${firebase.service.account.path}")
    private String resourcePath;

    @PostConstruct
    public void init() throws IOException {
        InputStream serviceAccount =
                getClass().getResourceAsStream(resourcePath);

        if (FirebaseApp.getApps().isEmpty() && serviceAccount != null) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            logger.info("Firebase initialized successfully!");
        }
    }
}
