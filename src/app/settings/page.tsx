"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notificationService } from "@/lib/notifications";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    // Check notification permission status
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === "granted");
    }

    // Load saved preferences
    const savedPref = localStorage.getItem("notificationsEnabled");
    if (savedPref) {
      setNotificationsEnabled(savedPref === "true");
    }
  }, [router]);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();

    if (granted) {
      setNotificationsEnabled(true);
      setNotificationPermission("granted");
      localStorage.setItem("notificationsEnabled", "true");

      // Show test notification
      await notificationService.showNotification("Notifications Enabled", {
        body: "You will now receive booking reminders and updates",
      });
    } else {
      alert("Notification permission was denied. Please enable notifications in your browser settings.");
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    localStorage.setItem("notificationsEnabled", "false");
  };

  const handleTestNotification = async () => {
    if (notificationsEnabled) {
      await notificationService.showNotification("Test Notification", {
        body: "This is a test notification from P-Connect",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1 active:opacity-60">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Settings</h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Notifications Section */}
        <h2 className="text-xl font-bold mb-4">Notifications</h2>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              {notificationsEnabled ? (
                <Bell className="w-6 h-6 text-primary mt-1" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400 mt-1" />
              )}
              <div>
                <h3 className="font-semibold text-lg mb-1">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Get reminders about your upcoming bookings and important updates
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {notificationPermission === "denied" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Notifications are blocked in your browser. Please enable them in your browser settings to receive updates.
              </p>
            </div>
          )}

          {notificationPermission === "default" && !notificationsEnabled && (
            <Button
              onClick={handleEnableNotifications}
              className="w-full mb-3"
            >
              Enable Notifications
            </Button>
          )}

          {notificationsEnabled && (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Booking reminders (24h before)</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Booking reminders (1h before)</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Booking confirmations</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Cancellation notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  className="flex-1"
                >
                  Test Notification
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisableNotifications}
                  className="flex-1"
                >
                  Disable
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Privacy Section */}
        <h2 className="text-xl font-bold mb-4">Privacy & Data</h2>
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Data Storage</h3>
              <p className="text-sm text-gray-600 mb-3">
                Your booking data is stored securely and used only for managing your bookings.
              </p>
              <Button variant="outline" size="sm">
                View Privacy Policy
              </Button>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data.
              </p>
              <Link href="/login">
                <Button variant="destructive" size="sm">
                  Request Account Deletion
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
