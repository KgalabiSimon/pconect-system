"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowLeft, Building2, Calendar, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingsPage() {
  const router = useRouter();
  const { bookingState, setBuilding, setFloor, setType, setDate, setTime } = useBooking();
  const [step, setStep] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const buildings = [
    { id: 41 as const, name: "Building 41" },
    { id: 42 as const, name: "Building 42" },
    { id: "DSTI" as const, name: "DSTI Building" },
  ];
  const floors = ["Ground", "1st", "2nd"] as const;
  const bookingTypes = [
    { id: "desk" as const, name: "Desk", desc: "Hot desk for the day" },
    { id: "office" as const, name: "Office", desc: "Private office space" },
    { id: "meeting_room" as const, name: "Meeting Room", desc: "Book by the hour" },
  ];

  const handleNext = () => {
    if (step === 1 && !bookingState.building) {
      alert("Please select a building");
      return;
    }
    if (step === 2 && !bookingState.type) {
      alert("Please select a booking type");
      return;
    }
    if (step === 3 && !bookingState.date) {
      alert("Please select a date");
      return;
    }
    // Step 4 is only for meeting rooms - time selection
    if (step === 4 && bookingState.type === "meeting_room") {
      if (!startTime || !endTime) {
        alert("Please select both start and end time");
        return;
      }
      // Validate that end time is after start time
      if (endTime <= startTime) {
        alert("End time must be after start time");
        return;
      }
      setTime(startTime, endTime);
      router.push("/bookings/availability");
      return;
    }

    // For desk and office, skip time step and go straight to availability after date
    if (step === 3 && bookingState.type !== "meeting_room") {
      router.push("/bookings/availability");
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        {step === 1 ? (
          <Link href="/" className="text-primary p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        ) : (
          <button onClick={handleBack} className="text-primary p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-semibold text-foreground">New Booking</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {(bookingState.type === "meeting_room" ? [1, 2, 3, 4] : [1, 2, 3]).map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < (bookingState.type === "meeting_room" ? 4 : 3) && (
                <div
                  className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          Step {step} of {bookingState.type === "meeting_room" ? 4 : 3}: {
            step === 1 ? "Building" :
            step === 2 ? "Type" :
            step === 3 ? "Date" :
            "Time"
          }
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Step 1: Select Building */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Select Building</h2>
            <div className="grid grid-cols-2 gap-4">
              {buildings.map((bldg) => (
                <Card
                  key={bldg.id}
                  onClick={() => setBuilding(bldg.id)}
                  className={`p-6 cursor-pointer transition-all ${
                    bookingState.building === bldg.id
                      ? "border-2 border-primary bg-primary/5"
                      : "border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <Building2 className="w-12 h-12 text-primary mx-auto mb-3" />
                  <div className="text-center font-semibold">{bldg.name}</div>
                </Card>
              ))}
            </div>

            {/* Optional Floor Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Filter by Floor (Optional)</label>
              <div className="flex gap-2">
                {floors.map((floor) => (
                  <button
                    key={floor}
                    onClick={() =>
                      setFloor(bookingState.floor === floor ? undefined : floor)
                    }
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      bookingState.floor === floor
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Booking Type */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Select Booking Type</h2>
            <div className="space-y-3">
              {bookingTypes.map((type) => (
                <Card
                  key={type.id}
                  onClick={() => setType(type.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    bookingState.type === type.id
                      ? "border-2 border-primary bg-primary/5"
                      : "border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Select Date</h2>
            <div className="space-y-3">
              <label className="text-sm font-medium">Booking Date</label>
              <Input
                type="date"
                value={bookingState.date || ""}
                onChange={(e) => setDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                max={new Date(Date.now() + 172800000).toISOString().split("T")[0]}
                className="h-14 text-base"
              />
              <p className="text-sm text-gray-500">
                Desk bookings must be 24-48 hours in advance
              </p>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="text-sm space-y-1">
                <p>Building: {bookingState.building}</p>
                {bookingState.floor && <p>Floor: {bookingState.floor}</p>}
                <p>Type: {bookingTypes.find((t) => t.id === bookingState.type)?.name}</p>
                {bookingState.date && <p>Date: {bookingState.date}</p>}
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Select Time (Meeting Rooms Only) */}
        {step === 4 && bookingState.type === "meeting_room" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Select Meeting Time</h2>

            <div className="space-y-4">
              {/* Start Time */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-14 px-4 text-base border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select start time</option>
                  <option value="06:00">06:00 AM</option>
                  <option value="07:00">07:00 AM</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>

              {/* End Time */}
              <div className="space-y-3">
                <label className="text-sm font-medium">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-14 px-4 text-base border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select end time</option>
                  <option value="07:00">07:00 AM</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
              </div>

              {/* Duration Display */}
              {startTime && endTime && endTime > startTime && (
                <Card className="p-3 bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Duration: {
                        (() => {
                          const start = parseInt(startTime.split(':')[0]);
                          const end = parseInt(endTime.split(':')[0]);
                          const duration = end - start;
                          return `${duration} hour${duration > 1 ? 's' : ''}`;
                        })()
                      }
                    </span>
                  </div>
                </Card>
              )}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="text-sm space-y-1">
                <p>Building: {bookingState.building}</p>
                {bookingState.floor && <p>Floor: {bookingState.floor}</p>}
                <p>Type: Meeting Room</p>
                <p>Date: {bookingState.date}</p>
                {startTime && endTime && (
                  <p>Time: {startTime} - {endTime}</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 h-12"
            >
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 h-12">
            {step === 3 ? "View Availability" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
