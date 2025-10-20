import { NextRequest, NextResponse } from "next/server";

// Mock spaces database
const mockSpaces = [
  {
    id: "desk-101",
    name: "Hot Desk 101",
    building: 41,
    floor: "Ground",
    type: "desk",
    location: "Near lift, North-facing",
    accessories: ["Adjustable desk", "Monitor arm", "Charging port"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
    capacity: 1,
    coordinates: { x: 45, y: 30 },
  },
  {
    id: "desk-102",
    name: "Hot Desk 102",
    building: 41,
    floor: "1st",
    type: "desk",
    location: "Window seat, South-facing",
    accessories: ["Drawer", "24\" Monitor", "HDMI"],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
    floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
    capacity: 1,
    coordinates: { x: 65, y: 25 },
  },
  {
    id: "office-201",
    name: "Private Office 201",
    building: 41,
    floor: "2nd",
    type: "office",
    location: "Corner office, quiet zone",
    accessories: ["Desk", "Chair", "Monitor", "Whiteboard"],
    image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&h=300&fit=crop",
    floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
    capacity: 4,
    coordinates: { x: 80, y: 20 },
  },
  {
    id: "meeting-301",
    name: "Meeting Room 3A",
    building: 42,
    floor: "2nd",
    type: "meeting_room",
    location: "East wing, near kitchen",
    accessories: ["Conference table", "TV Screen", "Video conferencing", "Whiteboard"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
    floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
    capacity: 8,
    coordinates: { x: 25, y: 60 },
  },
];

// Mock bookings to check availability
const mockBookings = [
  { spaceId: "office-201", date: "2025-10-20" },
];

// GET - Fetch available spaces
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const building = searchParams.get("building");
    const type = searchParams.get("type");
    const date = searchParams.get("date");
    const floor = searchParams.get("floor");

    let filteredSpaces = [...mockSpaces];

    // Filter by building
    if (building) {
      filteredSpaces = filteredSpaces.filter(
        s => s.building === parseInt(building)
      );
    }

    // Filter by type
    if (type) {
      filteredSpaces = filteredSpaces.filter(s => s.type === type);
    }

    // Filter by floor
    if (floor) {
      filteredSpaces = filteredSpaces.filter(s => s.floor === floor);
    }

    // Check availability for date
    if (date) {
      const bookedSpaceIds = mockBookings
        .filter(b => b.date === date)
        .map(b => b.spaceId);

      filteredSpaces = filteredSpaces.map(space => ({
        ...space,
        available: !bookedSpaceIds.includes(space.id),
      }));
    } else {
      // Default all to available if no date specified
      filteredSpaces = filteredSpaces.map(space => ({
        ...space,
        available: true,
      }));
    }

    return NextResponse.json({
      success: true,
      data: filteredSpaces,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch spaces" },
      { status: 500 }
    );
  }
}
