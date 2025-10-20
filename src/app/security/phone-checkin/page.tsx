"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, UserCheck, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PhoneCheckinPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResult, setSearchResult] = useState<{
    name: string;
    type: string;
    building: string;
    photo: string;
  } | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState([
    { name: "Jane Smith", phone: "+27 82 123 4567", time: "2 mins ago", action: "Check-In" },
    { name: "Mike Johnson", phone: "+27 83 987 6543", time: "5 mins ago", action: "Check-Out" },
  ]);

  const handleSearch = () => {
    if (phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    // Simulate search
    setSearchResult({
      name: "Sarah Williams",
      type: "Visitor",
      building: "Building 41",
      photo: "SW",
    });
  };

  const handleCheckIn = () => {
    if (!searchResult) return;

    // Add to recent check-ins
    setRecentCheckIns(prev => [{
      name: searchResult.name,
      phone: phoneNumber,
      time: "Just now",
      action: "Check-In"
    }, ...prev.slice(0, 4)]);

    // Clear search
    setPhoneNumber("");
    setSearchResult(null);

    alert(`${searchResult.name} checked in successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/security" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Phone Number Check-In</h1>
          <p className="text-xs text-gray-400">Manual Entry System</p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Search Card */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4">Enter Phone Number</h2>
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 h-14 text-lg bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={handleSearch}
              className="h-14 px-6 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Search Result */}
        {searchResult && (
          <Card className="bg-gray-800 border-green-600 border-2 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {searchResult.photo}
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold">{searchResult.name}</h3>
                <p className="text-gray-400 text-sm">{searchResult.type}</p>
                <p className="text-gray-500 text-xs">{searchResult.building}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCheckIn}
                className="h-14 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                Check In
              </Button>
              <Button
                onClick={handleCheckIn}
                className="h-14 bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Check Out
              </Button>
            </div>
          </Card>
        )}

        {/* Recent Check-Ins */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentCheckIns.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{entry.name}</p>
                  <p className="text-gray-400 text-xs">{entry.phone}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    entry.action === "Check-In" ? "text-green-400" : "text-orange-400"
                  }`}>
                    {entry.action}
                  </p>
                  <p className="text-gray-500 text-xs">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
