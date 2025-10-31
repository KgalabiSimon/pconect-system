"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { CheckInResponse } from "@/types/api";

export default function CheckInPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { buildings, isLoading: buildingsLoading } = useBuildings();
  const { 
    checkIn, 
    generateQRCode, 
    getActiveCheckIns,
    isLoading: checkInLoading, 
    error, 
    clearError 
  } = useCheckIns();
  
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [hasLaptop, setHasLaptop] = useState("");
  const [laptopName, setLaptopName] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasActiveCheckIn, setHasActiveCheckIn] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckInResponse | null>(null);

  // Floor and Block data structure
  const floorBlockData: Record<string, string[]> = {
    "Ground Floor": ["Block A", "Block B", "Block C"],
    "First Floor": ["Block D", "Block E", "Block F"],
    "Second Floor": ["Block G", "Block H", "Block I"],
    "Third Floor": ["Block J", "Block K", "Block L"],
  };

  // Check for existing active check-in on mount
  useEffect(() => {
    const checkActiveCheckIn = async () => {
      if (!user?.id) {
        setChecking(false);
        return;
      }

      try {
        const activeCheckIns = await getActiveCheckIns(user.id);
        if (activeCheckIns.length > 0) {
          const activeCheckIn = activeCheckIns[0];
          setHasActiveCheckIn(true);
          setActiveCheckIn(activeCheckIn);
          
          // Redirect to QR page if QR code exists
          if (activeCheckIn.qr_code) {
            router.push(`/checkin/qr?data=${activeCheckIn.qr_code}&employeeId=${activeCheckIn.id}&date=${activeCheckIn.check_in_time.split('T')[0]}`);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking active check-ins:', error);
      } finally {
        setChecking(false);
      }
    };

    if (isAuthenticated && user) {
      checkActiveCheckIn();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, user, getActiveCheckIns, router]);

  const handleFloorChange = (value: string) => {
    setSelectedFloor(value);
    setSelectedBlock(""); // Reset block when floor changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    // Validate all required fields
    if (!selectedFloor) {
      alert("Please select a floor");
      return;
    }

    if (!selectedBlock) {
      alert("Please select a block");
      return;
    }

    if (!hasLaptop) {
      alert("Please select if you have a laptop");
      return;
    }

    // If user has laptop, validate laptop fields
    if (hasLaptop === "yes") {
      if (!laptopName.trim()) {
        alert("Please enter laptop name");
        return;
      }
      if (!assetNumber.trim()) {
        alert("Please enter asset number");
        return;
      }
    }

    try {
      clearError();
      
      // Create check-in data
      const checkInData = {
        user_id: user.id,
        building_id: user.building_id || buildings[0]?.id || "", // Use user's building or first available
        floor: selectedFloor,
        block: selectedBlock,
        laptop_model: hasLaptop === "yes" ? laptopName : undefined,
        laptop_asset_number: hasLaptop === "yes" ? assetNumber : undefined,
        purpose: "Work",
      };

      // Create check-in
      const newCheckIn = await checkIn(checkInData);
      
      if (newCheckIn) {
        // Generate QR code
        const qrData = {
          user_id: user.id,
          building_id: checkInData.building_id,
          floor: selectedFloor,
          block: selectedBlock,
          laptop_model: checkInData.laptop_model,
          laptop_asset_number: checkInData.laptop_asset_number,
        };

        const qrResult = await generateQRCode(qrData);
        
        if (qrResult) {
          // Redirect to QR page
          const today = new Date().toISOString().split('T')[0];
          router.push(`/checkin/qr?data=${qrResult.qr_code}&employeeId=${newCheckIn.id}&date=${today}`);
        } else {
          alert("Check-in created but failed to generate QR code");
        }
      } else {
        alert("Failed to create check-in. Please try again.");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Failed to create check-in. Please try again.");
    }
  };

  // Show loading while checking for active QR code
  if (checking || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking for active access pass...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1 active:opacity-60">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Check-in</h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Floor Selection */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Select Floor
            </label>
            <Select value={selectedFloor} onValueChange={handleFloorChange}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder="Choose a floor" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(floorBlockData).map((floor) => (
                  <SelectItem key={floor} value={floor}>
                    {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Block Selection - Only show if floor is selected */}
          {selectedFloor && (
            <div className="space-y-2">
              <label className="text-sm md:text-base font-medium text-foreground">
                Select Block
              </label>
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                  <SelectValue placeholder="Choose a block" />
                </SelectTrigger>
                <SelectContent>
                  {floorBlockData[selectedFloor]?.map((block) => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Do you have a laptop? */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Do you have a laptop?
            </label>
            <Select value={hasLaptop} onValueChange={setHasLaptop}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Laptop Name - Only show if "Yes" is selected */}
          {hasLaptop === "yes" && (
            <>
              <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-foreground">
                  Laptop Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter laptop name"
                  value={laptopName}
                  onChange={(e) => setLaptopName(e.target.value)}
                  className="h-12 md:h-14 text-base border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-foreground">
                  Asset Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter asset number"
                  value={assetNumber}
                  onChange={(e) => setAssetNumber(e.target.value)}
                  className="h-12 md:h-14 text-base border-gray-300"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg mt-2"
            disabled={checkInLoading}
          >
            {checkInLoading ? "Creating Check-in..." : "CHECK IN"}
          </Button>
        </form>

        {/* History & Analytics Button */}
        <Link href="/checkin/history" className="block mt-4">
          <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5" />
            View History & Analytics
          </Button>
        </Link>
      </div>
    </div>
    </ProtectedRoute>
  );
}
