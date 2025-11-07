"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBooking } from "@/contexts/BookingContext";
import { useSpaces } from "@/hooks/api/useSpaces";
import { useBookings } from "@/hooks/api/useBookings";
import { useBuildings } from "@/hooks/api/useBuildings";
import { ArrowLeft, MapPin, Monitor, Plug, Users, Map, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";

function AvailabilityPageContent() {
  const router = useRouter();
  const { bookingState, setSpace } = useBooking();
  const { buildings, loadBuildings } = useBuildings({ initialLoad: true });
  const { 
    spaces, 
    isLoading: spacesLoading, 
    error: spacesError, 
    loadBuildingSpaces,
    clearError: clearSpacesError 
  } = useSpaces({ buildingId: bookingState.building as string, initialLoad: false });
  const { 
    checkAvailability, 
    loadBookings,
    error: bookingsError,
    clearError: clearBookingsError 
  } = useBookings();
  
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [spaceAvailability, setSpaceAvailability] = useState<Record<string, boolean>>({});

  // Ensure buildings are loaded
  useEffect(() => {
    if (buildings.length === 0) {
      loadBuildings();
    }
  }, [buildings.length, loadBuildings]);

  // Helper function to map floor string to integer
  const mapFloorToInteger = useCallback((floor?: string): number => {
    if (!floor) return 0; // Default to ground floor
    const floorMap: Record<string, number> = {
      "Ground": 0,
      "1st": 1,
      "2nd": 2,
    };
    return floorMap[floor] ?? 0;
  }, []);

  // Helper function to map booking type to SpaceType enum
  const mapBookingTypeToSpaceType = useCallback((type?: string): "DESK" | "OFFICE" | "ROOM" => {
    const typeMap: Record<string, "DESK" | "OFFICE" | "ROOM"> = {
      "desk": "DESK",
      "office": "OFFICE",
      "meeting_room": "ROOM",
    };
    return typeMap[type || "desk"] || "DESK";
  }, []);

  const loadSpacesAndAvailability = useCallback(async () => {
    if (!bookingState.building || !bookingState.floor || !bookingState.date) return;

    try {
      // Load spaces for the building (for display purposes)
      const loadedSpaces = await loadBuildingSpaces(bookingState.building as string);
      
      const floorInteger = mapFloorToInteger(bookingState.floor);
      const spaceType = mapBookingTypeToSpaceType(bookingState.type);
      const startTime = bookingState.startTime || "06:00";
      const endTime = bookingState.endTime || "18:00";

      // Format booking_date for API query (date-time format)
      const bookingDate = bookingState.date.includes('T') 
        ? bookingState.date 
        : `${bookingState.date}T00:00:00`;

      // Fetch existing bookings for this building/type/date to see which spaces are already booked
      // This gives us the actual space_id values that are booked
      const existingBookings = await loadBookings({
        building_id: bookingState.building,
        space_type: spaceType,
        booking_date: bookingDate,
        // Include all statuses (pending, checked_in) - only exclude checked_out
        // status: 'pending' | 'checked_in' - but we'll filter out checked_out in the logic
      }).catch(() => []); // If user doesn't have permission, return empty array

      // Extract space_ids that are already booked (and not checked out)
      const bookedSpaceIds = new Set(
        existingBookings
          .filter(booking => 
            booking.status !== 'checked_out' && // Exclude checked-out bookings
            booking.space_id // Only include bookings with space_id
          )
          .map(booking => booking.space_id)
      );

      // Initialize availability map - all spaces start as available
      const availabilityMap: Record<string, boolean> = {};
      // Use loadedSpaces from the API call (avoids dependency issues and infinite loops)
      const spacesToCheck = loadedSpaces || [];
      
      for (const space of spacesToCheck) {
        // Only check spaces that match the requested type
        const spaceMatchesType = 
          (bookingState.type === "desk" && space.type === "DESK") ||
          (bookingState.type === "office" && space.type === "OFFICE") ||
          (bookingState.type === "meeting_room" && space.type === "ROOM");
        
        if (spaceMatchesType) {
          // Mark space as unavailable if it's in the booked set
          availabilityMap[space.id] = !bookedSpaceIds.has(space.id);
        }
      }
      
      setSpaceAvailability(availabilityMap);
      // Clear any errors from availability check
      clearBookingsError();
    } catch (error) {
      // Log error but don't break the UI
      console.error('Error loading spaces and availability:', error);
      // On error, mark all spaces as available (backend will validate on booking)
      const availabilityMap: Record<string, boolean> = {};
      const loadedSpaces = await loadBuildingSpaces(bookingState.building as string).catch(() => []);
      (loadedSpaces || []).forEach(space => {
        const spaceMatchesType = 
          (bookingState.type === "desk" && space.type === "DESK") ||
          (bookingState.type === "office" && space.type === "OFFICE") ||
          (bookingState.type === "meeting_room" && space.type === "ROOM");
        if (spaceMatchesType) {
          availabilityMap[space.id] = true; // Default to available on error
        }
      });
      setSpaceAvailability(availabilityMap);
    }
  }, [
    bookingState.building,
    bookingState.floor,
    bookingState.date,
    bookingState.type,
    bookingState.startTime,
    bookingState.endTime,
    // Remove 'spaces' from dependencies to prevent infinite loop
    // Use loadedSpaces from the API call instead
    loadBuildingSpaces,
    loadBookings,
    mapFloorToInteger,
    mapBookingTypeToSpaceType,
  ]);

  // Load spaces and check availability when component mounts or booking state changes
  useEffect(() => {
    if (bookingState.building && bookingState.floor && bookingState.date) {
      loadSpacesAndAvailability();
    }
  }, [bookingState.building, bookingState.floor, bookingState.date, bookingState.type, bookingState.startTime, bookingState.endTime, loadSpacesAndAvailability]);

  // Filter spaces by type
  const filteredSpaces = spaces.filter(space => {
    if (bookingState.type === "desk") return space.type === "DESK";
    if (bookingState.type === "office") return space.type === "OFFICE";
    if (bookingState.type === "meeting_room") return space.type === "ROOM";
    return true;
  });

  // Simulate real-time availability updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadSpacesAndAvailability();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [bookingState.building, bookingState.floor, bookingState.date, bookingState.type, bookingState.startTime, bookingState.endTime, loadSpacesAndAvailability]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSpacesAndAvailability();
    setRefreshing(false);
  };

  const handleBook = () => {
    // Note: With new API, space is auto-assigned by backend
    // We don't need to select a specific space anymore
    // Just proceed to confirm page with building/floor/type info
    router.push("/bookings/confirm");
  };

  // Use useMemo to compute building name and update when buildings load
  const buildingName = useMemo(() => {
    if (!bookingState.building) return "Unknown Building";
    
    const building = buildings.find(b => b.id === bookingState.building);
    
    // Try name first, then building_code, then fallback to ID
    if (building) {
      return building.name || building.building_code || `Building ${building.id}`;
    }
    
    // If building not found yet, return a placeholder
    // This can happen if buildings are still loading
    return "Loading...";
  }, [bookingState.building, buildings]);

  // Helper to get building name by ID (for space cards)
  const getBuildingNameById = useCallback((buildingId?: string) => {
    if (!buildingId) return "Unknown Building";
    
    const building = buildings.find(b => b.id === buildingId);
    
    if (building) {
      return building.name || building.building_code || `Building ${building.id}`;
    }
    
    return "Loading...";
  }, [buildings]);

  if (!bookingState.building || !bookingState.floor || !bookingState.type || !bookingState.date) {
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

  // Show loading state
  if (spacesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Error Messages */}
      {(spacesError || bookingsError) && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{spacesError || bookingsError}</span>
            <button
              onClick={() => {
                clearSpacesError();
                clearBookingsError();
              }}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            <span>{buildingName}</span>
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
          {filteredSpaces.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No spaces found</h3>
              <p className="text-gray-600">
                No {bookingState.type} spaces are available in {buildingName}.
              </p>
            </Card>
          ) : (
            filteredSpaces.map((space) => {
              const isAvailable = spaceAvailability[space.id] ?? true;
              const spaceImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop";
              const floorPlan = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop";
              
              return (
                <Card key={space.id} className="overflow-hidden">
                  {/* Space Image */}
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={spaceImage}
                      alt={space.type}
                      fill
                      className="object-cover"
                    />
                    {isAvailable ? (
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
                        <h3 className="font-semibold text-lg">{space.type} {space.id.slice(-3)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          {getBuildingNameById(space.building_id)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Users className="w-4 h-4" />
                          Quantity: {space.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {space.type}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                        <Plug className="w-3 h-3" />
                        Power Outlets
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFloorPlan(floorPlan)}
                        className="flex items-center gap-2"
                      >
                        <Map className="w-4 h-4" />
                        Floor Plan
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}

          {/* Continue Button - Only show if there are available spaces */}
          {filteredSpaces.length > 0 && (() => {
            // Count available spaces
            const availableSpacesCount = filteredSpaces.filter(space => 
              spaceAvailability[space.id] !== false
            ).length;
            
            return availableSpacesCount > 0 ? (
              <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
                <p className="text-sm text-blue-800 mb-4">
                  <strong>Note:</strong> {availableSpacesCount} space{availableSpacesCount !== 1 ? 's' : ''} available. A specific space will be automatically assigned to you when you confirm your booking.
                </p>
                <Button
                  onClick={handleBook}
                  className="w-full h-12 text-lg"
                  disabled={!bookingState.floor}
                >
                  Continue to Confirm Booking
                </Button>
              </Card>
            ) : (
              <Card className="p-4 bg-red-50 border-red-200 mt-4">
                <p className="text-sm text-red-800 mb-4">
                  <strong>No Available Spaces:</strong> All spaces of this type are already booked for {bookingState.date}. Please try a different date or space type.
                </p>
                <Link href="/bookings">
                  <Button variant="outline" className="w-full h-12 text-lg">
                    Change Booking Details
                  </Button>
                </Link>
              </Card>
            );
          })()}
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
              <h3 className="text-xl font-bold mb-4">Floor Plan - {buildingName}</h3>
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedFloorPlan}
                  alt="Floor plan"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                {/* Space markers on floor plan */}
                {filteredSpaces.map((space, index) => {
                  const isAvailable = spaceAvailability[space.id] ?? true;
                  const coordinates = { x: 20 + (index * 20), y: 30 + (index % 2) * 30 };
                  
                  return (
                    <div
                      key={space.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${coordinates.x}%`, top: `${coordinates.y}%` }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        isAvailable
                          ? 'bg-green-500 border-green-700'
                          : 'bg-red-500 border-red-700'
                      } flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-125 transition-transform`}>
                        {space.id.slice(-1)}
                      </div>
                    </div>
                  );
                })}
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

export default function AvailabilityPage() {
  return (
    <ProtectedRoute>
      <AvailabilityPageContent />
    </ProtectedRoute>
  );
}
