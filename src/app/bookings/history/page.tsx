"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BookingHistoryPage() {
  // Sample booking history data
  const [bookingHistory] = useState([
    {
      id: "BK-HIST001",
      type: "desk",
      building: 41,
      space: "Hot Desk 101",
      date: "2025-10-10",
      time: "06:00 - 18:00",
      status: "completed",
    },
    {
      id: "BK-HIST002",
      type: "meeting_room",
      building: 42,
      space: "Meeting Room 3A",
      date: "2025-10-12",
      time: "14:00 - 16:00",
      status: "completed",
    },
    {
      id: "BK-HIST003",
      type: "office",
      building: 41,
      space: "Private Office 201",
      date: "2025-10-14",
      time: "06:00 - 18:00",
      status: "completed",
    },
    {
      id: "BK-HIST004",
      type: "desk",
      building: 42,
      space: "Hot Desk 205",
      date: "2025-10-08",
      time: "06:00 - 18:00",
      status: "cancelled",
    },
  ]);

  // Analytics data
  const analytics = {
    totalBookings: 15,
    thisMonth: 8,
    lastMonth: 7,
    mostBooked: "Hot Desk 101",
    preferredBuilding: "Building 41",
    avgBookingsPerWeek: 3.5,
  };

  // Booking type breakdown
  const bookingsByType = [
    { type: "Desk", count: 8, percentage: 53 },
    { type: "Meeting Room", count: 5, percentage: 33 },
    { type: "Office", count: 2, percentage: 14 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/bookings/mine" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Booking History & Analytics
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Total Bookings</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.totalBookings}
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
              <span className="text-sm text-gray-600 mb-1">Avg/Week</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.avgBookingsPerWeek}
              </span>
            </div>
          </Card>
        </div>

        {/* Booking Type Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Bookings by Type</h3>
          <div className="space-y-4">
            {bookingsByType.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.type}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} ({item.percentage}%)
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

        {/* Most Used Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Booked Space</div>
                <div className="font-semibold">{analytics.mostBooked}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Preferred Building</div>
                <div className="font-semibold">{analytics.preferredBuilding}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking History */}
        <h2 className="text-xl font-bold mb-4">Booking History</h2>
        <div className="space-y-3">
          {bookingHistory.map((booking) => (
            <Card key={booking.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{booking.space}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    Building {booking.building}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    booking.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {booking.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {booking.time}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <Link href="/bookings/mine" className="block mt-6">
          <Button variant="outline" className="w-full">
            Back to My Bookings
          </Button>
        </Link>
      </div>
    </div>
  );
}
