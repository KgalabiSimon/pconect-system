import { NextRequest, NextResponse } from "next/server";

// Mock notifications storage
interface NotificationSubscription {
  userId: string;
  subscription: Record<string, unknown>;
  createdAt: string;
}

const mockNotifications: NotificationSubscription[] = [];

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "user123";

    if (!body.subscription) {
      return NextResponse.json(
        { success: false, error: "Missing subscription data" },
        { status: 400 }
      );
    }

    // Store subscription
    const notification = {
      userId,
      subscription: body.subscription,
      createdAt: new Date().toISOString(),
    };

    mockNotifications.push(notification);

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to notifications",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "user123";

    // Remove subscriptions for this user
    const index = mockNotifications.findIndex(n => n.userId === userId);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from notifications",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

// GET - Send test notification
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "user123";

    // In real app, would send actual push notification
    return NextResponse.json({
      success: true,
      message: "Test notification sent",
      data: {
        title: "Booking Reminder",
        body: "Your booking starts in 30 minutes",
        icon: "/icon.png",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
