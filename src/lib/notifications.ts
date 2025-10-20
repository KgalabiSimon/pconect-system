// Push Notification Service
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request permission for push notifications
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  // Show a local notification
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.warn("Notification permission not granted");
      return;
    }

    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }

  // Schedule a booking reminder
  async scheduleBookingReminder(bookingId: string, bookingDate: string, spaceName: string): Promise<void> {
    const bookingTime = new Date(bookingDate);
    const now = new Date();
    const timeDiff = bookingTime.getTime() - now.getTime();

    // Schedule notification 24 hours before
    const reminderTime = timeDiff - (24 * 60 * 60 * 1000);

    if (reminderTime > 0) {
      setTimeout(() => {
        this.showNotification("Booking Reminder", {
          body: `You have a booking at ${spaceName} tomorrow`,
          tag: `booking-${bookingId}`,
          requireInteraction: true,
        });
      }, reminderTime);
    }

    // Schedule notification 1 hour before
    const hourBeforeTime = timeDiff - (60 * 60 * 1000);

    if (hourBeforeTime > 0) {
      setTimeout(() => {
        this.showNotification("Booking Starting Soon", {
          body: `Your booking at ${spaceName} starts in 1 hour`,
          tag: `booking-${bookingId}-soon`,
          requireInteraction: true,
        });
      }, hourBeforeTime);
    }
  }

  // Send notification for booking confirmation
  async notifyBookingConfirmed(spaceName: string, date: string): Promise<void> {
    await this.showNotification("Booking Confirmed!", {
      body: `Your booking for ${spaceName} on ${date} has been confirmed`,
      tag: "booking-confirmed",
    });
  }

  // Send notification for booking cancellation
  async notifyBookingCancelled(spaceName: string): Promise<void> {
    await this.showNotification("Booking Cancelled", {
      body: `Your booking for ${spaceName} has been cancelled`,
      tag: "booking-cancelled",
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
