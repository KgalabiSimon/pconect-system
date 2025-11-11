"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, HelpCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/api/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if user just registered
    if (searchParams?.get("registered") === "true") {
      setShowSuccessMessage(true);
      // Remove query param from URL
      router.replace("/login", { scroll: false });
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    clearError();

    try {
      const success = await loginUser(email, password);
      
      if (success) {
        // Login successful, redirect to home page
        router.push("/");
      } else {
        // Error will be handled by the auth context
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-12 bg-white relative">
      {/* Support Button - Top Right */}
      <Link
        href="/support"
        className="absolute top-4 right-4 p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95 flex items-center gap-2 group"
      >
        <HelpCircle className="w-6 h-6 text-primary" />
        <span className="text-sm font-medium text-primary hidden md:inline-block">
          Need Help?
        </span>
      </Link>

      {/* Logo Header */}
      <div className="w-full flex flex-col items-center mb-8 md:mb-12">
        {/* P-Connect Logo */}
        <div className="relative w-32 h-32 md:w-52 md:h-52 mb-4">
          <Image
            src="https://ext.same-assets.com/2434544859/849502017.png"
            alt="P Connect Logo"
            fill
            sizes="(max-width: 768px) 128px, 208px"
            className="object-contain"
          />
        </div>

        {/* Powered by / For Badge */}
        <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Proudly serving</span>
          <div className="relative w-24 h-12 md:w-32 md:h-14">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_O60OjGZ-JvEMg_5BRHor1H_aSpq_oNxXA&s"
              alt="DSTI Logo"
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-xl px-2 md:px-4">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Registration successful! Please log in with your credentials.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="relative">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base border-[1.5px] border-gray-300 rounded-lg focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 text-base border-[1.5px] border-gray-300 rounded-lg focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-white pr-12"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-14 text-base md:text-lg font-semibold bg-[#265e91] hover:bg-[#1e4a6f] text-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              "LOGIN"
            )}
          </Button>

          {/* Forgot Password */}
          <div className="text-center pt-2">
            <Link
              href="/reset-password"
              className="text-sm text-primary/70 hover:text-primary uppercase tracking-wide"
            >
              Forgot Password
            </Link>
          </div>

          {/* Sign Up Links */}
          <div className="pt-4 space-y-2 text-sm text-gray-700">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an Account
              </Link>
            </p>
            <p>
              Request deletion of account{" "}
              <Link href="#" className="text-primary hover:underline">
                here
              </Link>
            </p>
            <p>
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline font-semibold">
                Contact Support
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
