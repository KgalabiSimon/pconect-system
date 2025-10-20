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
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
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

  // Building data
  const buildings = [
    "The Department of Science, Technology and Innovation",
    "Building 41",
    "Building 42",
  ];

  // Programme data
  const programmes = [
    "Programme 1A",
    "Programme 1B",
    "Programme 2",
    "Programme 3",
    "Programme 4",
    "Programme 5",
    "Programme 6",
  ];

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    // Load user data from sessionStorage (in real app, would fetch from API)
    const storedFirstName = sessionStorage.getItem("firstName") || "John";
    const storedLastName = sessionStorage.getItem("lastName") || "Doe";
    const storedPhone = sessionStorage.getItem("phone") || "+27 123 456 789";
    const storedBuilding = sessionStorage.getItem("building") || "Building 41";
    const storedProgramme = sessionStorage.getItem("programme") || "Programme 1A";
    const storedLaptopModel = sessionStorage.getItem("laptopModel") || "Dell Latitude";
    const storedAssetNumber = sessionStorage.getItem("assetNumber") || "DST-001234";
    const storedEmail = sessionStorage.getItem("email") || "user@example.com";
    const storedSelfie = sessionStorage.getItem("selfieImage");

    setFirstName(storedFirstName);
    setLastName(storedLastName);
    setPhone(storedPhone);
    setBuilding(storedBuilding);
    setProgramme(storedProgramme);
    setLaptopModel(storedLaptopModel);
    setAssetNumber(storedAssetNumber);
    setEmail(storedEmail);
    setSelfieData(storedSelfie);
  }, [router]);

  const handleSave = () => {
    // Save updated data to sessionStorage (in real app, would send to API)
    sessionStorage.setItem("firstName", firstName);
    sessionStorage.setItem("lastName", lastName);
    sessionStorage.setItem("phone", phone);
    sessionStorage.setItem("building", building);
    sessionStorage.setItem("programme", programme);
    sessionStorage.setItem("laptopModel", laptopModel);
    sessionStorage.setItem("assetNumber", assetNumber);

    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleRetakeSelfie = () => {
    router.push("/register/camera");
  };

  return (
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
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        )}
      </div>

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
                {buildings.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {programmes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
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
  );
}
