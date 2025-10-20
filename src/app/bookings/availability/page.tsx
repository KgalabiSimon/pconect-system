"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowLeft, MapPin, Monitor, Plug, Users, Map, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AvailabilityPage() {
  const router = useRouter();
  const { bookingState, setSpace } = useBooking();
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Sample data - in real app, fetch from API
  const [spaces, setSpaces] = useState([
    {
      id: "desk-101",
      name: "Hot Desk 101",
      floor: "Ground",
      location: "Near lift, North-facing",
      accessories: ["Adjustable desk", "Monitor arm", "Charging port"],
      available: true,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
      capacity: 1,
      coordinates: { x: 45, y: 30 },
    },
    {
      id: "desk-102",
      name: "Hot Desk 102",
      floor: "1st",
      location: "Window seat, South-facing",
      accessories: ["Drawer", "24\" Monitor", "HDMI"],
      available: true,
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
      floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
      capacity: 1,
      coordinates: { x: 65, y: 25 },
    },
    {
      id: "office-201",
      name: "Private Office 201",
      floor: "2nd",
      location: "Corner office, quiet zone",
      accessories: ["Desk", "Chair", "Monitor", "Whiteboard"],
      available: false,
      image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&h=300&fit=crop",
      floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
      capacity: 4,
      coordinates: { x: 80, y: 20 },
    },
    {
      id: "meeting-301",
      name: "Meeting Room 3A",
      floor: "2nd",
      location: "East wing, near kitchen",
      accessories: ["Conference table", "TV Screen", "Video conferencing", "Whiteboard"],
      available: true,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
      floorPlan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
      capacity: 8,
      coordinates: { x: 25, y: 60 },
    },
  ]);

  // Simulate real-time availability updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, this would fetch from API or WebSocket
      setSpaces(prev => prev.map(space => ({
        ...space,
        // Randomly update availability for demo
        available: Math.random() > 0.3
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSpaces(prev => prev.map(space => ({
      ...space,
      available: Math.random() > 0.3
    })));
    setRefreshing(false);
  };

  const handleBook = (spaceId: string) => {
    setSpace(spaceId);
    router.push("/bookings/confirm");
  };

  if (!bookingState.building || !bookingState.type || !bookingState.date) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please complete the booking wizard first</p>
          <Link href="/bookings">
            <Button>Start Booking</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/bookings" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Available Spaces</h1>
      </div>

      {/* Booking Info Banner */}
      <div className="bg-primary text-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span>Building {bookingState.building}</span>
            <span>{bookingState.date}</span>
            <span>
              {bookingState.type === "meeting_room" && bookingState.startTime && bookingState.endTime
                ? `${bookingState.startTime} - ${bookingState.endTime}`
                : "06:00 - 18:00"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {bookingState.type} spaces
            {bookingState.floor && ` on ${bookingState.floor} floor`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              {/* Space Image */}
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={space.image}
                  alt={space.name}
                  fill
                  className="object-cover"
                />
                {space.available ? (
                  <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold shadow-sm">
                    Available
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold shadow-sm">
                    Booked
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{space.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {space.floor} Floor • {space.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Users className="w-4 h-4" />
                      Capacity: {space.capacity} {space.capacity === 1 ? "person" : "people"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {space.accessories.map((acc, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {acc.includes("Monitor") && <Monitor className="w-3 h-3" />}
                      {acc.includes("Charging") && <Plug className="w-3 h-3" />}
                      {acc}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFloorPlan(space.floorPlan)}
                    className="flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Floor Plan
                  </Button>
                  <Button
                    onClick={() => handleBook(space.id)}
                    disabled={!space.available}
                    className="flex-1 h-11"
                  >
                    {space.available ? "Book This Space" : "Not Available"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Link href="/bookings/mine" className="block mt-6">
          <Button variant="outline" className="w-full">
            View My Bookings
          </Button>
        </Link>
      </div>

      {/* Floor Plan Modal */}
      {selectedFloorPlan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full bg-white relative">
            <button
              onClick={() => setSelectedFloorPlan(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Floor Plan - Building {bookingState.building}</h3>
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedFloorPlan}
                  alt="Floor plan"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                {/* Space markers on floor plan */}
                {spaces.map((space) => (
                  <div
                    key={space.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${space.coordinates.x}%`, top: `${space.coordinates.y}%` }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      space.available
                        ? 'bg-green-500 border-green-700'
                        : 'bg-red-500 border-red-700'
                    } flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-125 transition-transform`}>
                      {space.id.split('-')[1]?.[0] || '?'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
