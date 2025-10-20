import { NextResponse } from "next/server";

// Sample employee data
const employees = [
  { id: "EMP-001", fullName: "John Doe", department: "Programme 1A", phoneExt: "1234" },
  { id: "EMP-002", fullName: "Sarah Williams", department: "Programme 2", phoneExt: "1235" },
  { id: "EMP-003", fullName: "Mike Johnson", department: "Programme 1B", phoneExt: "1236" },
  { id: "EMP-004", fullName: "Emma Davis", department: "IT Department", phoneExt: "1237" },
  { id: "EMP-005", fullName: "David Martinez", department: "HR Department", phoneExt: "1238" },
  { id: "EMP-006", fullName: "Lisa Anderson", department: "Finance", phoneExt: "1239" },
  { id: "EMP-007", fullName: "Robert Chen", department: "Operations", phoneExt: "1240" },
  { id: "EMP-008", fullName: "Jennifer Brown", department: "Marketing", phoneExt: "1241" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = employees
      .filter((emp) => emp.fullName.toLowerCase().includes(query))
      .slice(0, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Employee search error:", error);
    return NextResponse.json({ error: "Failed to search employees" }, { status: 500 });
  }
}
