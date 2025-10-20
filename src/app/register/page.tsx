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

export default function RegisterPage() {
  const router = useRouter();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }
    if (!password.trim()) {
      alert("Please enter a password");
      return;
    }
    if (!firstName.trim()) {
      alert("Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      alert("Please enter your last name");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }
    if (!building) {
      alert("Please select a building");
      return;
    }
    if (!employer) {
      alert("Please select a programme");
      return;
    }
    if (!laptopModel.trim()) {
      alert("Please enter your laptop model");
      return;
    }
    if (!assetNumber.trim()) {
      alert("Please enter your laptop asset number");
      return;
    }

    // Save registration data to sessionStorage
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("firstName", firstName);
    sessionStorage.setItem("lastName", lastName);
    sessionStorage.setItem("phone", phone);
    sessionStorage.setItem("building", building);
    sessionStorage.setItem("programme", employer);
    sessionStorage.setItem("laptopModel", laptopModel);
    sessionStorage.setItem("assetNumber", assetNumber);

    // Navigate to camera page for selfie
    router.push("/register/camera");
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
              <SelectContent>
                {buildings.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
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
              <SelectContent>
                {programmes.map((prog) => (
                  <SelectItem key={prog} value={prog}>
                    {prog}
                  </SelectItem>
                ))}
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
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg mt-4"
          >
            REGISTER
          </Button>
        </form>
      </div>
    </div>
  );
}
