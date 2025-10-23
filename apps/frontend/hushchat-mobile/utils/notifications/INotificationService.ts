export interface INotificationService {
  /**
   * Registers the device/browser for push notifications
   * and returns a unique token for the backend.
   */
  registerDevice(): Promise<string | null>;

  /**
   * Optional: listens for foreground notifications
   * and invokes callback when received.
   */
  onMessage?(callback: (data: any) => void): void;

  /**
   * Optional: display a local in-app notification
   * (for WebSocket events or foreground messages).
   */
  showLocalNotification?(title: string, body: string): void;
}
