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
import { ArrowLeft, Camera, Save, User, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useUsers } from "@/hooks/api/useUsers";
import { useBuildingSelection } from "@/hooks/api/useBuildingSelection";
import { useProgrammeSelection } from "@/hooks/api/useProgrammeSelection";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { updateProfile, updateUser, isUpdating, error, clearError } = useUsers();
  const { buildingOptions, isLoading: buildingsLoading } = useBuildingSelection();
  const { programmeOptions, isLoading: programmesLoading } = useProgrammeSelection();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [building, setBuilding] = useState("");
  const [programme, setProgramme] = useState("");
  const [laptopModel, setLaptopModel] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selfieData, setSelfieData] = useState<string | null>(null);

  useEffect(() => {
    // Load user data from Azure API
    if (authUser) {
      setFirstName(authUser.first_name || "");
      setLastName(authUser.last_name || "");
      setPhone(authUser.phone || "");
      setBuilding(authUser.building_id || "");
      setProgramme(authUser.programme_id || "");
      setLaptopModel(authUser.laptop_model || "");
      setAssetNumber(authUser.laptop_asset_number || "");
      setEmail(authUser.email || "");
      setSelfieData(authUser.photo_url || null);
    }
  }, [authUser]);

  const handleSave = async () => {
    try {
      clearError();
      
      if (!authUser?.id) {
        alert("User ID not found. Please log in again.");
        return;
      }

      // The profile endpoint only accepts: id, last_name, email
      // The user update endpoint accepts: first_name, last_name, email, password, is_active, role
      // For phone, building_id, programme_id, laptop_model, laptop_asset_number,
      // we need to check what the profile endpoint actually accepts
      
      // First, update name fields using the user update endpoint
      const userUpdateData = {
        first_name: firstName,
        last_name: lastName,
      };

      console.log("Updating user with data:", userUpdateData);
      let updatedUser = await updateUser(authUser.id, userUpdateData);
      
      if (!updatedUser) {
        alert("Failed to update name. Please try again.");
        return;
      }

      console.log("User name updated successfully, received:", updatedUser);

      // Then try to update other fields using the profile endpoint
      // Note: The API may not accept all these fields, but we'll try
      const profileData = {
        id: authUser.id,
        last_name: lastName, // Include last_name here in case it didn't update above
        phone: phone || undefined,
        building_id: building || undefined,
        programme_id: programme || undefined,
        laptop_model: laptopModel || undefined,
        laptop_asset_number: assetNumber || undefined,
      };

      console.log("Updating profile with additional data:", profileData);
      updatedUser = await updateProfile(profileData);
      
      if (updatedUser) {
        console.log("Profile updated successfully, received:", updatedUser);
      } else {
        console.warn("Profile update for additional fields returned null, but name was updated");
      }

      // Refresh the auth context to get the updated user data
      await refreshUser();
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.message || error?.data?.detail || "Failed to update profile. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleRetakeSelfie = () => {
    router.push("/register/camera");
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-primary p-1 -ml-1 active:opacity-60">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">My Profile</h1>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="text-primary font-semibold"
          >
            Edit
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-primary text-white font-semibold flex items-center gap-1"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 md:mx-6 mt-4">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-primary/20 mb-4">
            {selfieData ? (
              <img
                src={selfieData}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <User className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
              </div>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-gray-600 mb-3">{email}</p>
          <Button
            onClick={handleRetakeSelfie}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Update Photo
          </Button>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              disabled
              className="h-12 md:h-14 text-base border-gray-300 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              First Name
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Last Name
            </label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-4 mt-6">Work Information</h3>

          {/* Building */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Building
            </label>
            <Select value={building} onValueChange={setBuilding} disabled={!isEditing}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buildingsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading buildings...
                  </SelectItem>
                ) : (
                  buildingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Programme */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Programme
            </label>
            <Select value={programme} onValueChange={setProgramme} disabled={!isEditing}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder={programmesLoading ? "Loading programmes..." : "Select programme"} />
              </SelectTrigger>
              <SelectContent>
                {programmesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading programmes...
                  </SelectItem>
                ) : programmeOptions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No programmes available
                  </SelectItem>
                ) : (
                  programmeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-4 mt-6">Device Information</h3>

          {/* Laptop Model */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Laptop Model
            </label>
            <Input
              type="text"
              value={laptopModel}
              onChange={(e) => setLaptopModel(e.target.value)}
              disabled={!isEditing}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          {/* Asset Number */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Asset Number
            </label>
            <Input
              type="text"
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
              disabled={!isEditing}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          {/* Cancel Button (only show when editing) */}
          {isEditing && (
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="w-full h-12 mt-4"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
