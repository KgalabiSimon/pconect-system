"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔐 Admin login attempt...");

    // Simple validation for demo
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      // Store admin session
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminEmail", email);
      sessionStorage.setItem("adminName", "Administrator");

      console.log("✅ Admin session created");
      console.log("Email:", email);
      console.log("Session stored:", sessionStorage.getItem("adminLoggedIn"));

      // Give a small delay to ensure storage is complete
      setTimeout(() => {
        console.log("🚀 Redirecting to admin dashboard...");
        router.push("/admin");
      }, 100);

    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Failed to login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 p-8 shadow-xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src="https://ext.same-assets.com/2434544859/849502017.png"
              alt="P-Connect Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
          <p className="text-sm text-gray-600">P-Connect Management System</p>
        </div>

        {/* Client Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-gray-200 rounded-xl p-3 mb-6">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Managing</span>
            <div className="relative w-24 h-12">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_O60OjGZ-JvEMg_5BRHor1H_aSpq_oNxXA&s"
                alt="DSTI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Admin Email</label>
            <Input
              type="email"
              placeholder="admin@dsti.gov.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base border-gray-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base border-gray-300 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-[#265e91] hover:bg-[#1e4a6f]"
          >
            Login to Admin Portal
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Authorized Personnel Only
          </p>
        </div>
      </Card>
    </div>
  );
}
