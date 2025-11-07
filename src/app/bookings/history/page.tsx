"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useBookings } from "@/hooks/api/useBookings";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { BookingResponse } from "@/types/api";

export default function BookingHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const { loadUserBookings, isLoading } = useBookings();
  const { buildings } = useBuildings({ initialLoad: true });
  const [allBookings, setAllBookings] = useState<BookingResponse[]>([]);

  // Load user bookings on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserBookings(user.id).then(setAllBookings);
    }
  }, [isAuthenticated, user?.id, loadUserBookings]);

  // Build building map for lookups
  const buildingMap = useMemo(() => {
    const map: Record<string, string> = {};
    buildings.forEach(building => {
      map[building.id] = building.name || building.building_code || building.id;
    });
    return map;
  }, [buildings]);

  // Filter historical bookings (past bookings or checked_out)
  const bookingHistory = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allBookings
      .filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        bookingDate.setHours(0, 0, 0, 0);
        // Include past bookings or checked_out bookings
        return bookingDate < today || booking.status === 'checked_out';
      })
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.booking_date).getTime();
        const dateB = new Date(b.booking_date).getTime();
        return dateB - dateA;
      });
  }, [allBookings]);

  // Calculate analytics from real data
  const analytics = useMemo(() => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisMonthBookings = bookingHistory.filter(b => {
      const bookingDate = new Date(b.booking_date);
      return bookingDate >= thisMonthStart;
    });

    const lastMonthBookings = bookingHistory.filter(b => {
      const bookingDate = new Date(b.booking_date);
      return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
    });

    // Calculate most booked space
    const spaceCounts: Record<string, number> = {};
    bookingHistory.forEach(b => {
      const spaceId = b.space_id || 'unknown';
      spaceCounts[spaceId] = (spaceCounts[spaceId] || 0) + 1;
    });
    const mostBookedSpaceId = Object.entries(spaceCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate preferred building
    const buildingCounts: Record<string, number> = {};
    bookingHistory.forEach(b => {
      const buildingId = b.building_id || 'unknown';
      buildingCounts[buildingId] = (buildingCounts[buildingId] || 0) + 1;
    });
    const preferredBuildingId = Object.entries(buildingCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate average bookings per week (last 4 weeks)
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);
    const recentBookings = bookingHistory.filter(b => {
      const bookingDate = new Date(b.booking_date);
      return bookingDate >= fourWeeksAgo;
    });
    const avgBookingsPerWeek = recentBookings.length / 4;

    return {
      totalBookings: bookingHistory.length,
      thisMonth: thisMonthBookings.length,
      lastMonth: lastMonthBookings.length,
      mostBooked: mostBookedSpaceId.substring(0, 8) + '...' || 'N/A',
      preferredBuilding: buildingMap[preferredBuildingId] || preferredBuildingId || 'N/A',
      avgBookingsPerWeek: Math.round(avgBookingsPerWeek * 10) / 10,
    };
  }, [bookingHistory, buildingMap]);

  // Booking type breakdown
  const bookingsByType = useMemo(() => {
    const typeCounts: Record<string, number> = {
      DESK: 0,
      OFFICE: 0,
      ROOM: 0,
    };

    bookingHistory.forEach(booking => {
      const spaceType = booking.space_type || booking.space?.type;
      if (spaceType === 'DESK' || spaceType === 'OFFICE' || spaceType === 'ROOM') {
        typeCounts[spaceType]++;
      }
    });

    const total = bookingHistory.length || 1;
    return [
      { type: "Desk", count: typeCounts.DESK, percentage: Math.round((typeCounts.DESK / total) * 100) },
      { type: "Meeting Room", count: typeCounts.ROOM, percentage: Math.round((typeCounts.ROOM / total) * 100) },
      { type: "Office", count: typeCounts.OFFICE, percentage: Math.round((typeCounts.OFFICE / total) * 100) },
    ];
  }, [bookingHistory]);

  return (
    <ProtectedRoute>
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
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking history...</p>
          </Card>
        ) : bookingHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Booking History</h3>
            <p className="text-gray-600">You haven't completed any bookings yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookingHistory.map((booking) => {
              const bookingDate = new Date(booking.booking_date);
              const dateStr = bookingDate.toISOString().split('T')[0];
              const spaceType = booking.space_type || booking.space?.type || 'Unknown';
              const buildingName = booking.building_id ? (buildingMap[booking.building_id] || booking.building_id) : 'Unknown Building';
              
              return (
                <Card key={booking.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">Space ID: {booking.space_id?.substring(0, 8)}...</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {buildingName}
                        {spaceType && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                            {spaceType === 'DESK' ? 'Desk' : spaceType === 'OFFICE' ? 'Office' : spaceType === 'ROOM' ? 'Meeting Room' : spaceType}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        booking.status === "checked_out"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "checked_in"
                          ? "bg-blue-100 text-blue-700"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status === "checked_out" ? "Checked Out" :
                       booking.status === "checked_in" ? "Checked In" :
                       booking.status === "pending" ? "Pending" :
                       booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {dateStr}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <Link href="/bookings/mine" className="block mt-6">
          <Button variant="outline" className="w-full">
            Back to My Bookings
          </Button>
        </Link>
      </div>
    </div>
    </ProtectedRoute>
  );
}
