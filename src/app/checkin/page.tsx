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
import { useToast } from "@/components/ui/toast";

export default function CheckInPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { buildings, isLoading: buildingsLoading } = useBuildings();
  const { 
    checkIn, 
    getActiveCheckIns,
    isLoading: checkInLoading, 
    error, 
    clearError 
  } = useCheckIns();
  const { success: showSuccess, error: showError, warning: showWarning, ToastContainer } = useToast();
  
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [hasLaptop, setHasLaptop] = useState("");
  const [laptopName, setLaptopName] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasActiveCheckIn, setHasActiveCheckIn] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckInResponse | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFormError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Prefill laptop information from user profile when user is available
  useEffect(() => {
    if (user?.laptop_model || user?.laptop_asset_number) {
      // Only prefill if fields are empty (don't overwrite user input)
      if (user.laptop_model && !laptopName) {
        setLaptopName(user.laptop_model);
      }
      if (user.laptop_asset_number && !assetNumber) {
        setAssetNumber(user.laptop_asset_number);
      }
      // Auto-select "yes" if user has laptop information and hasn't selected yet
      if (user.laptop_model && user.laptop_asset_number && !hasLaptop) {
        setHasLaptop("yes");
      }
    }
  }, [user, laptopName, assetNumber, hasLaptop]);

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
        // getActiveCheckIns now handles 403 gracefully and returns empty array
        if (activeCheckIns && activeCheckIns.length > 0) {
          const activeCheckIn = activeCheckIns[0];
          setHasActiveCheckIn(true);
          setActiveCheckIn(activeCheckIn);
          
          // Redirect to QR page if QR code exists
          if (activeCheckIn.qr_code_data || activeCheckIn.id) {
            const qrCode = activeCheckIn.qr_code_data || activeCheckIn.id;
            router.push(`/checkin/qr?data=${qrCode}&date=${activeCheckIn.check_in_time.split('T')[0]}`);
            return;
          }
        }
        // If no active check-ins found (or empty array from 403), continue normally
      } catch (error: any) {
        // Only handle unexpected errors (403 is handled in getActiveCheckIns)
        if (error?.status !== 403) {
          showWarning("Could not verify existing check-ins. You may need to try again.");
        }
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
    clearFormError("floor");
    clearFormError("block");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showError("You must be logged in to check in.");
      return;
    }

    const validationErrors: Record<string, string> = {};

    if (!selectedFloor) {
      validationErrors.floor = "Please select a floor";
    }

    if (!selectedBlock) {
      validationErrors.block = "Please select a block";
    }

    if (!hasLaptop) {
      validationErrors.hasLaptop = "Please select whether you have a laptop";
    }

    if (hasLaptop === "yes") {
      if (!laptopName.trim()) {
        validationErrors.laptopName = "Please enter the laptop model";
      }
      if (!assetNumber.trim()) {
        validationErrors.assetNumber = "Please enter the asset number";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        showError(firstError);
      }
      return;
    }

    setFormErrors({});

    try {
      clearError();

      const checkInData = {
        user_id: user.id,
        floor: selectedFloor,
        block: selectedBlock,
        laptop_model: hasLaptop === "yes" ? laptopName : "None",  // Required by API
        laptop_asset_number: hasLaptop === "yes" ? assetNumber : "N/A",  // Required by API
      };

      // Call checkIn with all the form data
      const checkInResult = await checkIn(checkInData);
      
      if (checkInResult) {
        // API returns CheckInResponse with qr_code_data (which is the check-in ID UUID)
        // The QR code data should be the check-in ID (UUID string)
        const qrCodeString = checkInResult.qr_code_data || checkInResult.id;

        if (!qrCodeString) {
          showError("Failed to generate a QR code. Please try again.");
          return;
        }
        
        // Validate that it's a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(qrCodeString)) {
          showError("Invalid check-in ID returned by the server. Please try again.");
          return;
        }
        
        // Redirect to QR page with check-in ID
        const today = new Date().toISOString().split('T')[0];
        const encodedData = encodeURIComponent(qrCodeString);
        showSuccess("Check-in created successfully.");
        router.push(`/checkin/qr?data=${encodedData}&date=${today}`);
      } else {
        showError("Failed to create check-in. Please try again.");
      }
    } catch (error: any) {
      // Extract the actual error message from the API
      let errorMessage = "Failed to create check-in. Please try again.";
      
      // For validation/business logic errors (400/422), extract detailed message first
      if (error?.status === 400 || error?.status === 422) {
        const details = error?.details || {};
        
        // FastAPI can return detail as string or array
        if (details?.detail) {
          if (typeof details.detail === 'string') {
            // Direct error message from backend (e.g., "User already has an active check-in")
            errorMessage = details.detail;
          } else if (Array.isArray(details.detail)) {
            // Multiple validation errors
            const errors = details.detail.map((err: any) => {
              const field = err.loc?.join('.') || 'unknown';
              return `${field}: ${err.msg}`;
            }).join(', ');
            errorMessage = `Validation failed: ${errors}`;
          }
        }
      }
      
      // Fall back to error.message if we didn't get a good message from details
      if (errorMessage === "Failed to create check-in. Please try again." && error?.message) {
        errorMessage = error.message;
      }

      setFormErrors((prev) => ({ ...prev, form: errorMessage }));
      showError(errorMessage);
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
        <ToastContainer />
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
            {formErrors.floor && (
              <p className="text-sm text-red-600 mt-1">{formErrors.floor}</p>
            )}
          </div>

          {/* Block Selection - Only show if floor is selected */}
          {selectedFloor && (
            <div className="space-y-2">
              <label className="text-sm md:text-base font-medium text-foreground">
                Select Block
              </label>
              <Select
                value={selectedBlock}
                onValueChange={(value) => {
                  setSelectedBlock(value);
                  clearFormError("block");
                }}
              >
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
              {formErrors.block && (
                <p className="text-sm text-red-600 mt-1">{formErrors.block}</p>
              )}
            </div>
          )}

          {/* Do you have a laptop? */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Do you have a laptop?
            </label>
            <Select
              value={hasLaptop}
              onValueChange={(value) => {
                setHasLaptop(value);
                clearFormError("hasLaptop");
                if (value === "no") {
                  clearFormError("laptopName");
                  clearFormError("assetNumber");
                }
              }}
            >
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.hasLaptop && (
              <p className="text-sm text-red-600 mt-1">{formErrors.hasLaptop}</p>
            )}
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
                  onChange={(e) => {
                    setLaptopName(e.target.value);
                    clearFormError("laptopName");
                  }}
                  className="h-12 md:h-14 text-base border-gray-300"
                />
                {formErrors.laptopName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.laptopName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-foreground">
                  Asset Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter asset number"
                  value={assetNumber}
                  onChange={(e) => {
                    setAssetNumber(e.target.value);
                    clearFormError("assetNumber");
                  }}
                  className="h-12 md:h-14 text-base border-gray-300"
                />
                {formErrors.assetNumber && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.assetNumber}</p>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          {formErrors.form && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formErrors.form}
            </div>
          )}
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
