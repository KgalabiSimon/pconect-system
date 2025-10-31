"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBooking } from "@/contexts/BookingContext";
import { useBookings } from "@/hooks/api/useBookings";
import { useBuildings } from "@/hooks/api/useBuildings";
import { useSpaces } from "@/hooks/api/useSpaces";
import { Check, Plus, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConfirmBookingPage() {
  const router = useRouter();
  const { bookingState, resetBooking } = useBooking();
  const { buildings } = useBuildings();
  const { spaces } = useSpaces({ buildingId: bookingState.building as string, initialLoad: false });
  const { createBooking, isLoading: isCreating, error } = useBookings();
  
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);

  const isMeetingRoom = bookingState.type === "meeting_room";

  const addGuestEmail = () => {
    if (currentEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentEmail)) {
        alert("Please enter a valid email address");
        return;
      }
      if (guestEmails.includes(currentEmail)) {
        alert("This email has already been added");
        return;
      }
      setGuestEmails([...guestEmails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const removeGuestEmail = (email: string) => {
    setGuestEmails(guestEmails.filter((e) => e !== email));
  };

  const handleConfirm = async () => {
    if (!bookingState.spaceId || !bookingState.date) {
      alert("Missing required booking information");
      return;
    }

    try {
      // Prepare booking data for Azure API
      const bookingData = {
        space_id: bookingState.spaceId,
        booking_date: bookingState.date,
        start_time: bookingState.startTime || "06:00",
        end_time: bookingState.endTime || "18:00",
        guest_emails: guestEmails.length > 0 ? guestEmails.join(",") : undefined,
        notify_guests: sendNotifications && guestEmails.length > 0,
      };

      // Create booking via Azure API
      const newBooking = await createBooking(bookingData);
      
      if (newBooking) {
        // Navigate to success page with booking details
        const params = new URLSearchParams({
          building: bookingState.building?.toString() || "",
          type: bookingState.type || "desk",
          spaceId: bookingState.spaceId || "",
          date: bookingState.date || "",
          bookingId: newBooking.id,
        });

        // Add time for meeting rooms
        if (bookingState.type === "meeting_room" && bookingState.startTime && bookingState.endTime) {
          params.append("startTime", bookingState.startTime);
          params.append("endTime", bookingState.endTime);
        }

        resetBooking();
        router.push(`/bookings/success?${params.toString()}`);
      } else {
        alert("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    }
  };

  const getBuildingName = () => {
    const building = buildings.find(b => b.id === bookingState.building);
    return building?.name || `Building ${bookingState.building}`;
  };

  const getSpaceName = () => {
    const space = spaces.find(s => s.id === bookingState.spaceId);
    return space ? `${space.type} ${space.id.slice(-3)}` : bookingState.spaceId;
  };

  if (!bookingState.spaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">No space selected</p>
          <Link href="/bookings">
            <Button>Start Booking</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
        </div>

        <Card className="p-6 space-y-4 mb-6">
          <h3 className="font-semibold text-lg border-b pb-2">Booking Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Building:</span>
              <span className="font-medium">{getBuildingName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">
                {bookingState.type?.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Space:</span>
              <span className="font-medium">{getSpaceName()}</span>
            </div>
            {bookingState.floor && (
              <div className="flex justify-between">
                <span className="text-gray-600">Floor:</span>
                <span className="font-medium">{bookingState.floor}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{bookingState.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {bookingState.type === "meeting_room" && bookingState.startTime && bookingState.endTime
                  ? `${bookingState.startTime} - ${bookingState.endTime}`
                  : "06:00 - 18:00"}
              </span>
            </div>
          </div>
        </Card>

        {/* Guest Emails - Only for Meeting Rooms */}
        {isMeetingRoom && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">
              Invite Guests (Optional)
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter guest email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGuestEmail();
                    }
                  }}
                  className="flex-1 h-10"
                />
                <Button
                  type="button"
                  onClick={addGuestEmail}
                  size="icon"
                  className="h-10 w-10"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {guestEmails.length > 0 && (
                <div className="space-y-2">
                  {guestEmails.map((email, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => removeGuestEmail(email)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Notification Toggle */}
              <div className="flex items-center justify-between pt-3 border-t">
                <label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                  Send email notifications to guests
                </label>
                <button
                  type="button"
                  id="notifications"
                  onClick={() => setSendNotifications(!sendNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    sendNotifications ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sendNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Cancellation Policy */}
        <Card className="p-4 bg-amber-50 border-amber-200 mb-6">
          <h4 className="font-semibold text-sm mb-2">Cancellation Policy</h4>
          <p className="text-xs text-gray-700">
            {bookingState.type === "meeting_room"
              ? "Meeting room bookings can be cancelled up to 2 hours before the scheduled time."
              : "Desk and office bookings can be cancelled up to 12 hours before the scheduled date."}
          </p>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-14 text-lg"
            disabled={isCreating}
          >
            {isCreating ? "Creating Booking..." : "Confirm Booking"}
          </Button>
          <Link href="/bookings/availability">
            <Button variant="outline" className="w-full h-12">
              Back to Availability
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
