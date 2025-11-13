"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, QrCode, X, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useBookings } from "@/hooks/api/useBookings";
import { useAuth } from "@/hooks/api/useAuth";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { BookingResponse } from "@/types/api";

interface DisplayBooking {
  id: string;
  type: string;
  building: string;
  buildingName: string;
  space: string;
  floor?: string;
  date: string;
  time: string;
  status: "pending" | "checked_in" | "checked_out";
  qrCodeUrl?: string; // QR code URL from API if available
}

export default function MyBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { loadUserBookings, deleteBooking, isLoading, error } = useBookings();
  const { buildings, loadBuildings } = useBuildings({ initialLoad: true });
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<DisplayBooking | null>(null);

  // Load buildings if needed
  useEffect(() => {
    if (buildings.length === 0) {
      loadBuildings();
    }
  }, [buildings.length, loadBuildings]);

  // Load user bookings
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserBookings(user.id).then(setBookings);
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

  // Convert API bookings to display format
  const displayBookings = useMemo((): DisplayBooking[] => {
    return bookings.map(booking => {
      const buildingId = booking.building_id || "";
      const buildingName = buildingId ? (buildingMap[buildingId] || buildingId) : "Unknown Building";
      const spaceType = booking.space_type || booking.space?.type || "DESK";
      const spaceDetails = booking.space;
      const spaceName =
        spaceDetails && "name" in spaceDetails && typeof spaceDetails.name === "string"
          ? spaceDetails.name
          : `${spaceType} ${booking.id.slice(-3)}`;
      
      // Map space type to display type
      const displayType = spaceType === "DESK" ? "desk" : spaceType === "OFFICE" ? "office" : "meeting_room";
      
      // Extract date from booking_date (ISO format)
      const bookingDate = booking.booking_date ? booking.booking_date.split('T')[0] : "";
      
      // Format time
      const timeDisplay = booking.start_time && booking.end_time
        ? `${booking.start_time} - ${booking.end_time}`
        : "06:00 - 18:00";

      // Note: Floor information is not stored in BookingResponse
      // It was used during booking creation but may not be returned in the response
      // We'll show space name and building instead
      return {
        id: booking.id,
        type: displayType,
        building: buildingId,
        buildingName,
        space: spaceName,
        // Floor not available in API response
        date: bookingDate,
        time: timeDisplay,
        status: booking.status,
        qrCodeUrl: booking.qr_code_url, // Use QR code URL from API if available
      };
    });
  }, [bookings, buildingMap]);

  // Check for today's booking on mount and auto-show QR code
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Updated to use CheckInStatus: 'pending' | 'checked_in' | 'checked_out'
    const todayBooking = displayBookings.find(booking => 
      booking.date === today && 
      (booking.status === "pending" || booking.status === "checked_in")
    );

    if (todayBooking) {
      // Check if we're before midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);

      if (now < midnight) {
        // Auto-show QR code for today's booking
        setSelectedBooking(todayBooking);
      }
    }
  }, [displayBookings]);

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const success = await deleteBooking(id);
        if (success) {
          // Remove from local state
          setBookings(bookings.filter((b) => b.id !== id));
          alert("Booking cancelled successfully");
        } else {
          alert("Failed to cancel booking. Please try again.");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  const showQRCode = (booking: DisplayBooking) => {
    setSelectedBooking(booking);
  };

  const closeQRCode = () => {
    setSelectedBooking(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to view your bookings</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">My Bookings</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Today's Booking Alert */}
        {(() => {
          const today = new Date().toISOString().split('T')[0];
          // Updated to use CheckInStatus enum
          const todayBooking = displayBookings.find(b => 
            b.date === today && 
            (b.status === "pending" || b.status === "checked_in")
          );
          return todayBooking ? (
            <Card className="p-4 bg-green-50 border-green-200 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-1">Active Booking Today</h3>
                  <p className="text-sm text-green-700">
                    {todayBooking.space} - {todayBooking.buildingName}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedBooking(todayBooking)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR
                </Button>
              </div>
            </Card>
          ) : null;
        })()}

        {displayBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-4">You haven't made any bookings</p>
            <Link href="/bookings">
              <Button>Make a Booking</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.space}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {booking.buildingName}
                      {booking.floor && ` • ${booking.floor} Floor`}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === "checked_in" 
                      ? "bg-green-100 text-green-700"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : booking.status === "checked_out"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700" // fallback
                  }`}>
                    {booking.status === "checked_in" ? "Checked In" :
                     booking.status === "pending" ? "Pending" :
                     booking.status === "checked_out" ? "Checked Out" :
                     booking.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4" />
                    <span>{booking.time}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => showQRCode(booking)}
                  >
                    <QrCode className="w-4 h-4" />
                    View QR Code
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}

            <div className="space-y-3 mt-6">
              <Link href="/bookings/history" className="block">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  View History & Analytics
                </Button>
              </Link>
              <Link href="/bookings" className="block">
                <Button className="w-full">Make New Booking</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white relative">
            <button
              onClick={closeQRCode}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Access Pass QR Code</h3>

              <div className="bg-white p-4 rounded-lg inline-block mb-4 border-2 border-green-500">
                <QRCodeSVG
                  value={selectedBooking.qrCodeUrl || `https://p-connect.web.app/booking/${selectedBooking.id}?date=${selectedBooking.date}`}
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-left space-y-2 mb-4 bg-gray-50 p-4 rounded">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Space:</span>
                  <span className="font-medium">{selectedBooking.space}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Building:</span>
                  <span className="font-medium">{selectedBooking.buildingName}</span>
                </div>
                {selectedBooking.floor && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{selectedBooking.floor}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedBooking.time}</span>
                </div>
              </div>

              {/* Validity Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Valid Until:</span>
                  <span className="font-bold text-primary">12:00 AM</span>
                </div>
                <div className="text-xs text-gray-600 pt-2 border-t">
                  ✓ Use for Check-In & Check-Out<br />
                  ✓ Can be scanned multiple times until midnight
                </div>
              </div>

              <Button onClick={closeQRCode} className="w-full">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
