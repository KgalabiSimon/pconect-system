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
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CheckInPage() {
  const router = useRouter();
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [hasLaptop, setHasLaptop] = useState("");
  const [laptopName, setLaptopName] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [checking, setChecking] = useState(true);

  // Floor and Block data structure
  const floorBlockData: Record<string, string[]> = {
    "Ground Floor": ["Block A", "Block B", "Block C"],
    "First Floor": ["Block D", "Block E", "Block F"],
    "Second Floor": ["Block G", "Block H", "Block I"],
    "Third Floor": ["Block J", "Block K", "Block L"],
  };

  // Check for existing active QR code on mount
  useEffect(() => {
    const checkActiveQRCode = () => {
      const today = new Date().toISOString().split('T')[0];
      const userEmail = sessionStorage.getItem("email") || "user@example.com";
      const qrCodeKey = `qr_checkin_${userEmail}_${today}`;

      // Check if QR code exists for today
      const qrData = sessionStorage.getItem(qrCodeKey);
      const employeeId = sessionStorage.getItem(`${qrCodeKey}_employeeId`);
      const createdAt = sessionStorage.getItem(`${qrCodeKey}_createdAt`);

      if (qrData && employeeId && createdAt) {
        // Check if QR code is still valid (before midnight)
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(23, 59, 59, 999);

        if (now < midnight) {
          // QR code is still valid, redirect to QR page
          router.push(`/checkin/qr?data=${qrData}&employeeId=${employeeId}&date=${today}`);
          return;
        }
      }

      setChecking(false);
    };

    checkActiveQRCode();
  }, [router]);

  const handleFloorChange = (value: string) => {
    setSelectedFloor(value);
    setSelectedBlock(""); // Reset block when floor changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Get today's date as key
    const today = new Date().toISOString().split('T')[0];
    const userEmail = sessionStorage.getItem("email") || "user@example.com";
    const qrCodeKey = `qr_checkin_${userEmail}_${today}`;

    // Check if QR code already exists for today
    let qrData = sessionStorage.getItem(qrCodeKey);
    let employeeId = sessionStorage.getItem(`${qrCodeKey}_employeeId`);

    // If no QR code exists for today, create new one
    if (!qrData) {
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      qrData = generateUUID();
      employeeId = generateUUID();

      // Store QR code for today
      sessionStorage.setItem(qrCodeKey, qrData);
      sessionStorage.setItem(`${qrCodeKey}_employeeId`, employeeId);
      sessionStorage.setItem(`${qrCodeKey}_createdAt`, new Date().toISOString());

      // Store mapping between employeeId and email for security scanner
      sessionStorage.setItem(`employeeId_${employeeId}`, userEmail);
    }

    // Save check-in details
    sessionStorage.setItem(`${qrCodeKey}_floor`, selectedFloor);
    sessionStorage.setItem(`${qrCodeKey}_block`, selectedBlock);
    sessionStorage.setItem(`${qrCodeKey}_hasLaptop`, hasLaptop);
    if (hasLaptop === "yes") {
      sessionStorage.setItem(`${qrCodeKey}_laptopName`, laptopName);
      sessionStorage.setItem(`${qrCodeKey}_assetNumber`, assetNumber);
    }

    // Store all user data in localStorage for security scanner access
    const firstName = sessionStorage.getItem("firstName") || "Unknown";
    const lastName = sessionStorage.getItem("lastName") || "User";
    const phone = sessionStorage.getItem("phone") || "N/A";
    const building = sessionStorage.getItem("building") || "Unknown";
    const laptopModel = sessionStorage.getItem("laptopModel") || "N/A";
    const regAssetNumber = sessionStorage.getItem("assetNumber") || "N/A";

    const checkinData = {
      employeeId: employeeId,
      email: userEmail,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      building: building,
      floor: selectedFloor,
      block: selectedBlock,
      hasLaptop: hasLaptop,
      laptop: hasLaptop === "yes" ? (laptopName || laptopModel) : "No laptop",
      assetNumber: hasLaptop === "yes" ? (assetNumber || regAssetNumber) : "N/A",
      date: today,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage so security scanner can access it
    console.log("Storing check-in data to localStorage:", checkinData);
    localStorage.setItem(`checkin_${employeeId}`, JSON.stringify(checkinData));
    console.log("Stored successfully. Key:", `checkin_${employeeId}`);

    // Navigate to QR code page with query parameters
    router.push(`/checkin/qr?data=${qrData}&employeeId=${employeeId}&date=${today}`);
  };

  // Show loading while checking for active QR code
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking for active access pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          >
            CHECK IN
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
  );
}
