package com.platform.software.more.seeder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class SeederStatus {
    private boolean seedingComplete = false;

    @Value("${seederservice.seed}")
    private boolean seederServiceSeed;

    @PostConstruct
    public void init() {
        this.seedingComplete = !seederServiceSeed;
    }

    public boolean isSeedingComplete() {
        return seedingComplete;
    }

    public void setSeedingComplete(boolean seedingComplete) {
        this.seedingComplete = seedingComplete;
    }
}
