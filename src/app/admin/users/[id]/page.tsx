"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  TrendingUp,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Sample user data
  const user = {
    id: id,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+27 82 123 4567",
    building: "Building 41",
    programme: "Programme 1A",
    laptop: "Dell Latitude 5420",
    assetNumber: "DST-001",
    createdAt: "2025-09-15",
  };

  // Sample check-in history
  const checkIns = [
    {
      id: "CHK-001",
      date: "2025-10-15",
      timeIn: "08:30 AM",
      timeOut: "05:45 PM",
      duration: "9h 15m",
      floor: "Ground Floor",
      block: "Block A",
      building: "Building 41",
    },
    {
      id: "CHK-002",
      date: "2025-10-14",
      timeIn: "09:00 AM",
      timeOut: "06:15 PM",
      duration: "9h 15m",
      floor: "First Floor",
      block: "Block D",
      building: "Building 41",
    },
    {
      id: "CHK-003",
      date: "2025-10-13",
      timeIn: "08:45 AM",
      timeOut: "05:30 PM",
      duration: "8h 45m",
      floor: "Ground Floor",
      block: "Block B",
      building: "Building 41",
    },
  ];

  // Monthly statistics
  const monthlyStats = {
    october: { checkIns: 15, hours: 132.5 },
    september: { checkIns: 20, hours: 175.0 },
    august: { checkIns: 18, hours: 157.5 },
  };

  const downloadReport = () => {
    const csv = [
      ["Check-In Report for " + user.firstName + " " + user.lastName],
      [""],
      ["User Information"],
      ["ID", user.id],
      ["Email", user.email],
      ["Phone", user.phone],
      ["Building", user.building],
      ["Programme", user.programme],
      [""],
      ["Check-In History"],
      ["Date", "Time In", "Time Out", "Duration", "Floor", "Block", "Building"],
      ...checkIns.map((c) => [
        c.date,
        c.timeIn,
        c.timeOut,
        c.duration,
        c.floor,
        c.block,
        c.building,
      ]),
      [""],
      ["Monthly Summary"],
      ["Month", "Check-Ins", "Total Hours"],
      ["October 2025", monthlyStats.october.checkIns, monthlyStats.october.hours],
      ["September 2025", monthlyStats.september.checkIns, monthlyStats.september.hours],
      ["August 2025", monthlyStats.august.checkIns, monthlyStats.august.hours],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.firstName}-${user.lastName}-checkin-report.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-600">{user.id}</p>
            </div>
          </div>
          <Button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Download Report</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* User Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">{user.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Building</div>
                <div className="font-medium">{user.building}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Programme</div>
                <div className="font-medium">{user.programme}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Laptop</div>
                <div className="font-medium">{user.laptop}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-medium">{user.createdAt}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90 mb-1">October 2025</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.october.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.october.hours} hours</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90 mb-1">September 2025</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.september.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.september.hours} hours</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90 mb-1">August 2025</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.august.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.august.hours} hours</div>
          </Card>
        </div>

        {/* Check-In History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Check-In History</h2>
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <Card key={checkIn.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{checkIn.date}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {checkIn.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 text-xs">Time In</div>
                        <div className="font-medium text-green-700">{checkIn.timeIn}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Time Out</div>
                        <div className="font-medium text-orange-700">{checkIn.timeOut}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Duration</div>
                        <div className="font-medium text-blue-700">{checkIn.duration}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Location</div>
                        <div className="font-medium">{checkIn.floor}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{checkIn.block}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
