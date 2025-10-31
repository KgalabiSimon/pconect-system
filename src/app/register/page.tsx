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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBuildingSelectionPublic } from "@/hooks/api/useBuildingSelectionPublic";
import { useProgrammeSelectionPublic } from "@/hooks/api/useProgrammeSelectionPublic";
import { authService } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { buildingOptions, isLoading: buildingsLoading } = useBuildingSelectionPublic();
  const { programmeOptions, isLoading: programmesLoading } = useProgrammeSelectionPublic();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [building, setBuilding] = useState("");
  const [employer, setEmployer] = useState("");
  const [laptopModel, setLaptopModel] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all required fields
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!building) {
      setError("Please select a building");
      return;
    }
    if (!employer) {
      setError("Please select a programme");
      return;
    }
    if (!laptopModel.trim()) {
      setError("Please enter your laptop model");
      return;
    }
    if (!assetNumber.trim()) {
      setError("Please enter your laptop asset number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Register user directly with Azure API
      const userData = {
        email: email.trim(),
        password: password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        building_id: building,
        programme_id: employer,
        laptop_model: laptopModel.trim(),
        laptop_asset_number: assetNumber.trim(),
        is_active: true,
      };

      console.log("📝 Attempting registration with data:", { ...userData, password: "***" });
      const user = await authService.registerUser(userData);
      console.log("✅ Registration successful:", user);

      if (user && user.id) {
        // Registration successful - navigate to camera page for photo upload
        // Store minimal data in sessionStorage only for photo upload step
        sessionStorage.setItem("pendingPhotoUserId", user.id);
        console.log("📸 Navigating to camera page for user:", user.id);
        router.push("/register/camera");
      } else {
        console.error("❌ Registration failed - no user returned");
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      // Extract detailed error message
      let errorMessage = "Registration failed. Please try again.";
      
      if (err?.data?.detail) {
        if (Array.isArray(err.data.detail)) {
          // Handle validation errors
          errorMessage = err.data.detail.map((e: any) => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.data.detail;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      console.error("Error details:", { message: errorMessage, fullError: err });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/login" className="text-primary p-1 -ml-1 active:opacity-60">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Register</h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 md:h-14 text-base border-gray-300"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 md:h-14 text-base border-gray-300 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              First Name
            </label>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 md:h-14 text-base border-gray-300"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Last Name
            </label>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 md:h-14 text-base border-gray-300"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Phone
            </label>
            <Input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 md:h-14 text-base border-gray-300"
              required
            />
          </div>

          {/* Select Building */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Select building
            </label>
            <Select value={building} onValueChange={setBuilding}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder="Select a building" />
              </SelectTrigger>
              <SelectContent position="popper">
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

          {/* Select Programme */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Select programme
            </label>
            <Select value={employer} onValueChange={setEmployer}>
              <SelectTrigger className="h-12 md:h-14 text-base border-gray-300">
                <SelectValue placeholder="Select a programme" />
              </SelectTrigger>
              <SelectContent position="popper">
                {programmesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading programmes...
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

          {/* Laptop Model */}
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-foreground">
              Laptop Model
            </label>
            <Input
              type="text"
              placeholder="Laptop Model"
              value={laptopModel}
              onChange={(e) => setLaptopModel(e.target.value)}
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
              placeholder="Asset Number"
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
              className="h-12 md:h-14 text-base border-gray-300"
            />
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Registering...</span>
              </div>
            ) : (
              "REGISTER"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
