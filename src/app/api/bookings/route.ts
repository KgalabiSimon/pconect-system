import { NextRequest, NextResponse } from "next/server";

// Mock database - in real app, this would be a database connection
const mockBookings = [
  {
    id: "BK-A1B2C3D",
    userId: "user123",
    type: "desk",
    building: 41,
    space: "Hot Desk 101",
    floor: "Ground",
    date: "2025-10-20",
    time: "06:00 - 18:00",
    status: "confirmed",
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "BK-E4F5G6H",
    userId: "user123",
    type: "meeting_room",
    building: 42,
    space: "Meeting Room 3A",
    floor: "2nd",
    date: "2025-10-22",
    time: "14:00 - 16:00",
    status: "confirmed",
    guests: ["guest1@example.com", "guest2@example.com"],
    sendNotifications: true,
    createdAt: "2025-10-14T14:30:00Z",
  },
];

// GET - Fetch all bookings for a user
export async function GET(request: NextRequest) {
  try {
    // In real app, get userId from session/auth
    const userId = request.headers.get("x-user-id") || "user123";

    // Filter bookings by userId
    const userBookings = mockBookings.filter(b => b.userId === userId);

    return NextResponse.json({
      success: true,
      data: userBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "user123";

    // Validate required fields
    if (!body.type || !body.building || !body.space || !body.date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new booking
    const newBooking = {
      id: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      ...body,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    // In real app, save to database
    mockBookings.push(newBooking);

    return NextResponse.json({
      success: true,
      data: newBooking,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
