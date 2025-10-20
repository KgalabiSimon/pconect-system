import { NextResponse } from "next/server";

interface VisitorRegistration {
  timestamp: string;
  purpose: "EmployeeVisit" | "Other";
  employeeId?: string;
  employeeName?: string;
  otherReason?: string;
  floor?: string;
  block?: string;
  firstName: string;
  surname: string;
  company?: string;
  mobile: string;
  hasWeapons: boolean;
  weaponDetails?: string;
  photoUrl: string;
  deviceId: string;
}

// In-memory storage (in production, use a database)
const registrations: Array<VisitorRegistration & { id: string }> = [];

export async function POST(request: Request) {
  try {
    const body: VisitorRegistration = await request.json();

    // Validate required fields
    if (!body.firstName || !body.surname || !body.mobile || !body.photoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (body.purpose === "EmployeeVisit" && !body.employeeId) {
      return NextResponse.json(
        { error: "Employee ID required for employee visits" },
        { status: 400 }
      );
    }

    if (body.purpose === "Other" && !body.otherReason) {
      return NextResponse.json(
        { error: "Reason required for other visits" },
        { status: 400 }
      );
    }

    if (body.hasWeapons && !body.weaponDetails) {
      return NextResponse.json(
        { error: "Weapon details required when declaring weapons" },
        { status: 400 }
      );
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^\d{10}$/;
    const cleanMobile = body.mobile.replace(/\s/g, "");
    if (!mobileRegex.test(cleanMobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number format. Expected: 10 digits (e.g., 0821234567)" },
        { status: 400 }
      );
    }

    // Generate ID
    const id = `VIS-${String(registrations.length + 1).padStart(6, "0")}`;

    // Create registration
    const registration = {
      id,
      ...body,
      mobile: cleanMobile,
      timestamp: body.timestamp || new Date().toISOString(),
      deviceId: body.deviceId || "UNKNOWN",
    };

    registrations.push(registration);

    console.log("✅ Visitor registered:", {
      id,
      name: `${body.firstName} ${body.surname}`,
      mobile: cleanMobile,
      purpose: body.purpose,
      hasWeapons: body.hasWeapons,
    });

    // In production, you would:
    // 1. Save to database
    // 2. Send notification to host employee (if applicable)
    // 3. Trigger security alert if weapons declared
    // 4. Log audit trail
    // 5. Generate QR code for security check-in

    return NextResponse.json({
      id,
      status: "received",
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Return recent registrations (most recent first)
    const recent = registrations.slice(-limit).reverse();

    return NextResponse.json(recent);
  } catch (error) {
    console.error("GET registrations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
