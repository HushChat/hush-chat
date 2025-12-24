package com.platform.software.chat.notification.entity;

public enum DeviceType {
    MOBILE("MOBILE"),
    WEB("WEB"),
    UNKNOWN("UNKNOWN");

    private final String name;

    DeviceType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static DeviceType fromString(String value) {
        if (value == null) {
            return UNKNOWN;
        }
        for (DeviceType type : DeviceType.values()) {
            if (type.name.equalsIgnoreCase(value)) {
                return type;
            }
        }
        return UNKNOWN;
    }
}
