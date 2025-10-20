import { NextRequest, NextResponse } from "next/server";

// Type definition for check-in records
interface CheckInRecord {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  duration: string | null;
  floor: string;
  block: string;
  building: string;
  laptop: string;
  assetNumber: string;
  createdAt: string;
}

// Mock check-in database
const mockCheckIns: CheckInRecord[] = [
  {
    id: "CHK-001",
    userId: "user123",
    date: "2025-10-15",
    timeIn: "08:30 AM",
    timeOut: "05:45 PM",
    duration: "9h 15m",
    floor: "Ground Floor",
    block: "Block A",
    building: "Building 41",
    laptop: "Yes - Dell Latitude 5420",
    assetNumber: "DST-001234",
    createdAt: "2025-10-15T08:30:00Z",
  },
  {
    id: "CHK-002",
    userId: "user123",
    date: "2025-10-14",
    timeIn: "09:00 AM",
    timeOut: "06:15 PM",
    duration: "9h 15m",
    floor: "First Floor",
    block: "Block D",
    building: "Building 41",
    laptop: "Yes - Dell Latitude 5420",
    assetNumber: "DST-001234",
    createdAt: "2025-10-14T09:00:00Z",
  },
];

// GET - Fetch all check-ins for a user
export async function GET(request: NextRequest) {
  try {
    // In real app, get userId from session/auth
    const userId = request.headers.get("x-user-id") || "user123";

    // Filter check-ins by userId
    const userCheckIns = mockCheckIns.filter(c => c.userId === userId);

    // Calculate analytics
    const analytics = {
      totalCheckIns: userCheckIns.length,
      averageDuration: "8h 45m",
      totalHoursWorked: userCheckIns.length * 8.75,
      mostUsedFloor: "Ground Floor",
      mostUsedBlock: "Block A",
      mostUsedBuilding: "Building 41",
    };

    return NextResponse.json({
      success: true,
      data: userCheckIns,
      analytics,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

// POST - Create a new check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "user123";

    // Validate required fields
    if (!body.floor || !body.block) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new check-in
    const newCheckIn: CheckInRecord = {
      id: `CHK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      date: new Date().toISOString().split('T')[0],
      timeIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timeOut: null,
      duration: null,
      floor: body.floor,
      block: body.block,
      building: body.building || "Building 41",
      laptop: body.laptop || "No",
      assetNumber: body.assetNumber || "",
      createdAt: new Date().toISOString(),
    };

    // In real app, save to database
    mockCheckIns.push(newCheckIn);

    return NextResponse.json({
      success: true,
      data: newCheckIn,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}

// PATCH - Update check-out time
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, timeOut } = body;

    if (!id || !timeOut) {
      return NextResponse.json(
        { success: false, error: "Missing check-in ID or time out" },
        { status: 400 }
      );
    }

    // In real app, update in database
    const checkIn = mockCheckIns.find(c => c.id === id);
    if (checkIn) {
      checkIn.timeOut = timeOut;
      // Calculate duration
      // This is simplified - in real app, calculate actual duration
      checkIn.duration = "8h 30m";
    }

    return NextResponse.json({
      success: true,
      data: checkIn,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update check-out" },
      { status: 500 }
    );
  }
}
