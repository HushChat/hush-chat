package com.platform.software.common.context;

/** This class manages the current device context using a ThreadLocal variable.
 * It allows setting, getting, and clearing the current device identifier.
 * The use of InheritableThreadLocal allows child threads to inherit the value from the parent thread.
 */
public class DeviceContext {
    private static final ThreadLocal<String> currentDevice = new InheritableThreadLocal<>();

    public static String getCurrentDevice() {
        return currentDevice.get();
    }

    public static void setCurrentDevice(String device) {
        currentDevice.set(device);
    }

    public static void clear() {
        currentDevice.remove();
    }
}
