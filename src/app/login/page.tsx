"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Set logged in status
    sessionStorage.setItem("isLoggedIn", "true");
    // Store email for reference
    sessionStorage.setItem("email", email);
    // For demo purposes, extract name from email or use sample data
    const emailName = email.split('@')[0];
    const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    sessionStorage.setItem("firstName", firstName);
    sessionStorage.setItem("lastName", "User");
    // Navigate to home page after login
    router.push("/");
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
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-xl px-2 md:px-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base border-[1.5px] border-gray-300 rounded-lg focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              required
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

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-14 text-base md:text-lg font-semibold bg-[#265e91] hover:bg-[#1e4a6f] text-white rounded-lg shadow-sm"
          >
            LOGIN
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
