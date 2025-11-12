package com.platform.software;

import org.testcontainers.containers.GenericContainer;


public class SharedRedisContainer {

    private static final GenericContainer<?> redisContainer = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379)
            .withReuse(true);
    static {
        redisContainer.start();
        System.out.println("Redis container started at: " + redisContainer.getHost() + ":" + redisContainer.getMappedPort(6379));
    }

    public static GenericContainer<?> getInstance() {
        return redisContainer;
    }

    
}