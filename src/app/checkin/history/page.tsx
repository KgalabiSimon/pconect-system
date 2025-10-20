"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, TrendingUp, MapPin, Building2, Activity } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckInHistoryPage() {
  // Sample check-in history data
  const [checkInHistory] = useState([
    {
      id: "CHK-001",
      date: "2025-10-15",
      timeIn: "08:30 AM",
      timeOut: "05:45 PM",
      duration: "9h 15m",
      floor: "Ground Floor",
      block: "Block A",
      building: "Building 41",
      laptop: "Yes - Dell Latitude 5420",
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
      laptop: "Yes - Dell Latitude 5420",
    },
    {
      id: "CHK-003",
      date: "2025-10-13",
      timeIn: "08:45 AM",
      timeOut: "05:30 PM",
      duration: "8h 45m",
      floor: "Ground Floor",
      block: "Block B",
      building: "DSTI",
      laptop: "Yes - Dell Latitude 5420",
    },
    {
      id: "CHK-004",
      date: "2025-10-12",
      timeIn: "08:15 AM",
      timeOut: "04:00 PM",
      duration: "7h 45m",
      floor: "Second Floor",
      block: "Block H",
      building: "Building 42",
      laptop: "Yes - Dell Latitude 5420",
    },
    {
      id: "CHK-005",
      date: "2025-10-11",
      timeIn: "09:30 AM",
      timeOut: "06:00 PM",
      duration: "8h 30m",
      floor: "Ground Floor",
      block: "Block A",
      building: "Building 41",
      laptop: "Yes - Dell Latitude 5420",
    },
    {
      id: "CHK-006",
      date: "2025-10-10",
      timeIn: "08:00 AM",
      timeOut: "05:00 PM",
      duration: "9h 00m",
      floor: "First Floor",
      block: "Block C",
      building: "DSTI",
      laptop: "Yes - Dell Latitude 5420",
    },
  ]);

  // Analytics data
  const analytics = {
    totalCheckIns: 24,
    thisMonth: 18,
    lastMonth: 16,
    averageDuration: "8h 45m",
    mostUsedFloor: "Ground Floor",
    mostUsedBlock: "Block A",
    mostUsedBuilding: "Building 41 (50%)",
    totalHoursWorked: 198.5,
    averageCheckInTime: "08:42 AM",
    averageCheckOutTime: "05:38 PM",
  };

  // Floor usage breakdown
  const floorUsage = [
    { floor: "Ground Floor", count: 12, percentage: 50 },
    { floor: "First Floor", count: 7, percentage: 29 },
    { floor: "Second Floor", count: 5, percentage: 21 },
  ];

  // Building usage breakdown
  const buildingUsage = [
    { building: "Building 41", count: 12, percentage: 50 },
    { building: "Building 42", count: 8, percentage: 33 },
    { building: "DSTI (Dept. of Science, Technology & Innovation)", count: 4, percentage: 17 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/checkin" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Check-In History & Analytics
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Total Check-Ins</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.totalCheckIns}
              </span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">This Month</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {analytics.thisMonth}
                </span>
                {analytics.thisMonth > analytics.lastMonth && (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4 col-span-2 md:col-span-1">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Avg Duration</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.averageDuration}
              </span>
            </div>
          </Card>
        </div>

        {/* Time Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Avg Check-In Time</div>
                <div className="font-semibold text-lg">{analytics.averageCheckInTime}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Avg Check-Out Time</div>
                <div className="font-semibold text-lg">{analytics.averageCheckOutTime}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Total Hours</div>
                <div className="font-semibold text-lg">{analytics.totalHoursWorked}h</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Floor Usage Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Floor Usage</h3>
          <div className="space-y-4">
            {floorUsage.map((item) => (
              <div key={item.floor}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.floor}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} times ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Building Usage */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Building Usage</h3>
          <div className="space-y-4">
            {buildingUsage.map((item) => (
              <div key={item.building}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.building}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} times ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Used Locations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Building</div>
                <div className="font-semibold">{analytics.mostUsedBuilding}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Floor</div>
                <div className="font-semibold">{analytics.mostUsedFloor}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Block</div>
                <div className="font-semibold">{analytics.mostUsedBlock}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Check-In History */}
        <h2 className="text-xl font-bold mb-4">Check-In History</h2>
        <div className="space-y-3">
          {checkInHistory.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{record.date}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.building} • {record.floor} • {record.block}
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Completed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Time In</div>
                  <div className="font-semibold text-primary">{record.timeIn}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Time Out</div>
                  <div className="font-semibold text-amber-700">{record.timeOut}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold text-green-700">{record.duration}</div>
                </div>
              </div>

              {record.laptop && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Laptop:</strong> {record.laptop}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <Link href="/checkin" className="block mt-6">
          <Button variant="outline" className="w-full">
            Back to Check-In
          </Button>
        </Link>
      </div>
    </div>
  );
}
