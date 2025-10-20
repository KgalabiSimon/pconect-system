"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, useState, useEffect } from "react";

function QRCodeContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const employeeId = searchParams.get("employeeId");
  const dateParam = searchParams.get("date");
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });

  // Calculate time until midnight on client side only
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const today = new Date();
      const midnight = new Date(today);
      midnight.setHours(23, 59, 59, 999);

      const timeUntilMidnight = midnight.getTime() - today.getTime();
      const hoursRemaining = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ hours: hoursRemaining, minutes: minutesRemaining });
    };

    calculateTimeRemaining();
    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  // Construct the QR code URL
  const qrCodeUrl = `https://p-connect.web.app/checkin?data=${data}&employeeId=${employeeId}&date=${dateParam}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Daily Access Pass</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="flex flex-col items-center gap-4 md:gap-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl md:text-3xl font-bold text-green-600 mb-2">
              Access Pass Active
            </h2>
            <p className="text-sm text-gray-600">
              Valid for Check-In & Check-Out
            </p>
          </div>

          <p className="text-sm md:text-base text-foreground text-center px-4">
            Present this QR code to security when entering or leaving the building
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border-2 border-green-500">
            <QRCodeSVG
              value={qrCodeUrl}
              size={220}
              level="H"
              includeMargin={true}
              className="w-full max-w-[220px] md:max-w-[256px] h-auto"
            />
          </div>

          {/* Validity Info */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Valid Until:</span>
              <span className="text-sm font-bold text-primary">12:00 AM (Midnight)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
              <span className="text-sm font-bold text-green-600">
                {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">How to Use:</h3>
            <ul className="text-xs space-y-1 text-gray-700">
              <li>✓ Scan when entering the building (Check-In)</li>
              <li>✓ Scan when leaving the building (Check-Out)</li>
              <li>✓ Can be used multiple times until midnight</li>
              <li>✓ No need to create a new QR code today</li>
            </ul>
          </div>

          {/* Home Button */}
          <Link href="/" className="w-full max-w-xs mt-2 px-4">
            <Button
              className="w-full h-11 md:h-12 text-sm md:text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-md"
            >
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QRCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <QRCodeContent />
    </Suspense>
  );
}
