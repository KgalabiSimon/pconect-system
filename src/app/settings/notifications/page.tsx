"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell, BellOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationSettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setPermission(Notification.permission);
      // Check if user has previously enabled notifications
      const enabled = localStorage.getItem("notificationsEnabled") === "true";
      setNotificationsEnabled(enabled);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        // In real app, register service worker and subscribe to push
        localStorage.setItem("notificationsEnabled", "true");
        setNotificationsEnabled(true);

        // Show test notification
        new Notification("P-Connect Notifications Enabled", {
          body: "You'll receive reminders about your bookings",
          icon: "/icon.png",
        });

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Notification permission denied. Please enable in browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = () => {
    localStorage.setItem("notificationsEnabled", "false");
    setNotificationsEnabled(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sendTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "Your booking starts in 30 minutes",
        icon: "/icon.png",
        badge: "/badge.png",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Notification Settings
        </h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings updated successfully</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Current Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {notificationsEnabled ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <BellOff className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">
                {notificationsEnabled ? "Notifications Enabled" : "Notifications Disabled"}
              </h2>
              <p className="text-sm text-gray-600">
                {notificationsEnabled
                  ? "You'll receive booking reminders"
                  : "Enable to get booking reminders"}
              </p>
            </div>
          </div>

          {!notificationsEnabled ? (
            <Button
              onClick={requestNotificationPermission}
              disabled={loading}
              className="w-full h-12"
            >
              {loading ? "Requesting Permission..." : "Enable Notifications"}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
              >
                Send Test Notification
              </Button>
              <Button
                onClick={disableNotifications}
                variant="destructive"
                className="w-full"
              >
                Disable Notifications
              </Button>
            </div>
          )}
        </Card>

        {/* Notification Types */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Notification Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <div className="font-medium">Booking Reminders</div>
                <div className="text-sm text-gray-600">
                  Get notified 30 minutes before your booking
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${
                    notificationsEnabled ? "ml-6" : "ml-1"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <div className="font-medium">Booking Confirmations</div>
                <div className="text-sm text-gray-600">
                  Instant notification when booking is confirmed
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${
                    notificationsEnabled ? "ml-6" : "ml-1"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cancellation Alerts</div>
                <div className="text-sm text-gray-600">
                  Get notified if your booking is cancelled
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${
                    notificationsEnabled ? "ml-6" : "ml-1"
                  }`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-sm mb-2">About Notifications</h4>
          <p className="text-xs text-gray-700">
            Push notifications help you stay on top of your bookings. You can change
            these settings anytime. Make sure notifications are enabled in your
            browser settings for the best experience.
          </p>
        </Card>
      </div>
    </div>
  );
}
