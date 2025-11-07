"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/api/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Verify admin role after login
  useEffect(() => {
    if (justLoggedIn && isAuthenticated && user) {
      // Redirect to dashboard (API will enforce permissions)
      router.push("/admin");
      setJustLoggedIn(false);
      setIsSubmitting(false);
    }
  }, [justLoggedIn, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    clearError();

    try {
      const success = await loginAdmin(email, password);
      
      if (success) {
        // Set flag to trigger useEffect for role verification
        setJustLoggedIn(true);
        // Note: isSubmitting will be reset after redirect or in useEffect
      } else {
        // Login failed - reset submitting state
        setIsSubmitting(false);
      }
      // If login fails, error is handled by auth context - no need to log here
      // The 401 from admin login is expected and handled gracefully
    } catch (err: any) {
      // Error is handled by auth context and displayed to user
      setIsSubmitting(false);
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
              sizes="128px"
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
                sizes="96px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-[#265e91] hover:bg-[#1e4a6f] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Accessing...</span>
              </div>
            ) : (
              "Login to Admin Portal"
            )}
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
