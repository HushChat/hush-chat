package com.platform.software.chat.conversation.entity;

import java.time.temporal.ChronoUnit;

public enum PinnedDurationEnum {
    ONE_HOUR("1h", ChronoUnit.HOURS, 1),
    ONE_DAY("1d", ChronoUnit.DAYS, 1),
    SEVEN_DAYS("7d", ChronoUnit.DAYS, 7),
    THIRTY_DAYS("30d", ChronoUnit.DAYS, 30);

    private final String key;
    private final ChronoUnit unit;
    private final long amount;

    PinnedDurationEnum(String key, ChronoUnit unit, long amount) {
        this.key = key;
        this.unit = unit;
        this.amount = amount;
    }

    public String getKey() {
        return key;
    }

    public ChronoUnit getUnit() {
        return unit;
    }

    public long getAmount() {
        return amount;
    }

    public static PinnedDurationEnum fromKey(String key) {
        for (PinnedDurationEnum duration : values()) {
            if (duration.key.equalsIgnoreCase(key)) {
                return duration;
            }
        }
        return null;
    }
}
