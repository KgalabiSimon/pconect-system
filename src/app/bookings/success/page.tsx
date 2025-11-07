"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, MapPin, Clock, Home } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useBuildings } from "@/hooks/api/useBuildings";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildings, loadBuildings } = useBuildings({ initialLoad: true });
  const [timeDisplay, setTimeDisplay] = useState("");
  const [isToday, setIsToday] = useState(false);

  // Get booking details from URL params
  const buildingId = searchParams.get("building") || "";
  const type = searchParams.get("type") || "desk";
  const spaceId = searchParams.get("spaceId") || "";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const bookingId = searchParams.get("bookingId") || undefined;
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  // Ensure buildings are loaded
  useEffect(() => {
    if (buildings.length === 0) {
      loadBuildings();
    }
  }, [buildings.length, loadBuildings]);

  // Get building name by ID
  const buildingName = useMemo(() => {
    if (!buildingId) return "Unknown Building";
    
    const building = buildings.find(b => b.id === buildingId);
    
    // Try name first, then building_code, then fallback to ID
    if (building) {
      return building.name || building.building_code || `Building ${building.id}`;
    }
    
    // If building not found yet, return a placeholder
    // This can happen if buildings are still loading
    return "Loading...";
  }, [buildingId, buildings]);

  // Generate QR code data - include date for validation
  // Only generate QR code if bookingId is available
  const qrCodeUrl = bookingId 
    ? `https://p-connect.web.app/booking/${bookingId}?date=${date}`
    : "";

  const typeName = type === "desk" ? "Desk" : type === "office" ? "Office" : "Meeting Room";

  // Calculate time until midnight on client side only
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const bookingDate = new Date(date);
      const now = new Date();
      const isTodayCheck = bookingDate.toDateString() === now.toDateString();
      setIsToday(isTodayCheck);

      if (isTodayCheck) {
        const midnight = new Date(now);
        midnight.setHours(23, 59, 59, 999);
        const timeUntilMidnight = midnight.getTime() - now.getTime();
        const hoursRemaining = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
        setTimeDisplay(`${hoursRemaining}h ${minutesRemaining}m`);
      } else {
        setTimeDisplay("");
      }
    };

    calculateTimeRemaining();
    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center">
        {/* Success Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Your booking has been successfully created
        </p>

        {/* Booking Details Card */}
        <Card className="p-6 w-full mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-semibold">{buildingName}</div>
                {spaceId && (
                  <div className="text-sm text-gray-700">{spaceId}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-semibold">{date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-600">Time</div>
                <div className="font-semibold">
                  {type === "meeting_room" && startTime && endTime
                    ? `${startTime} - ${endTime}`
                    : "06:00 - 18:00"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* QR Code Card - Only show if bookingId is available */}
        {bookingId && qrCodeUrl && (
          <Card className="p-6 w-full mb-6">
            <h3 className="font-semibold text-center mb-4">Your Access Pass QR Code</h3>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-green-500">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Use for Check-In & Check-Out on {date}
            </p>

            {/* Validity Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Valid Until:</span>
                <span className="font-bold text-primary">12:00 AM (Midnight)</span>
              </div>
              {isToday && timeDisplay && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Time Remaining:</span>
                  <span className="font-bold text-green-600">{timeDisplay}</span>
                </div>
              )}
              <div className="text-xs text-gray-600 pt-2 border-t">
                ✓ Can be scanned multiple times until midnight
              </div>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6 w-full">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> A confirmation email has been sent to your registered email address.
            You can also view this booking in "My Bookings" section.
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link href="/bookings/mine" className="block">
            <Button variant="outline" className="w-full h-12">
              View My Bookings
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full h-12 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
