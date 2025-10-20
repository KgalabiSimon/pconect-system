"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, QrCode, X, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function MyBookingsPage() {
  // Sample bookings - in real app, fetch from API
  const [bookings, setBookings] = useState([
    {
      id: "BK-A1B2C3D",
      type: "desk",
      building: 41,
      space: "Hot Desk 101",
      floor: "Ground",
      date: "2025-10-20",
      time: "06:00 - 18:00",
      status: "confirmed",
    },
    {
      id: "BK-E4F5G6H",
      type: "meeting_room",
      building: 42,
      space: "Meeting Room 3A",
      floor: "2nd",
      date: "2025-10-22",
      time: "14:00 - 16:00",
      status: "confirmed",
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);

  // Check for today's booking on mount and auto-show QR code
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBooking = bookings.find(booking => booking.date === today && booking.status === "confirmed");

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
  }, [bookings]);

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setBookings(bookings.filter((b) => b.id !== id));
      alert("Booking cancelled successfully");
    }
  };

  const showQRCode = (booking: typeof bookings[0]) => {
    setSelectedBooking(booking);
  };

  const closeQRCode = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">My Bookings</h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Today's Booking Alert */}
        {(() => {
          const today = new Date().toISOString().split('T')[0];
          const todayBooking = bookings.find(b => b.date === today && b.status === "confirmed");
          return todayBooking ? (
            <Card className="p-4 bg-green-50 border-green-200 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-1">Active Booking Today</h3>
                  <p className="text-sm text-green-700">
                    {todayBooking.space} - Building {todayBooking.building}
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

        {bookings.length === 0 ? (
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
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.space}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      Building {booking.building} • {booking.floor} Floor
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {booking.status}
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
                  value={`https://p-connect.web.app/booking/${selectedBooking.id}?date=${selectedBooking.date}`}
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
                  <span className="font-medium">Building {selectedBooking.building}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedBooking.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium font-mono text-xs">{selectedBooking.id}</span>
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
  );
}
