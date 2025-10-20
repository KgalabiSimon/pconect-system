"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Save email and show success popup
    setSubmittedEmail(email);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setEmail("");
    setSubmittedEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/login" className="text-primary p-1 -ml-1 active:opacity-60">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">Reset Password</h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
        {/* Logo */}
        <div className="w-full flex justify-center mb-6 md:mb-8">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src="https://ext.same-assets.com/2434544859/849502017.png"
              alt="P Connect Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="w-full max-w-xl">
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 md:h-14 text-base border-gray-300"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg"
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 md:p-8 max-w-md w-full bg-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Email Sent!
              </h3>
              <p className="text-gray-600 mb-1">
                Password reset link has been sent to:
              </p>
              <p className="text-primary font-semibold mb-6 break-all">
                {submittedEmail}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please check your email and click the link to reset your password.
                If you don't see the email, check your spam folder.
              </p>
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                OK
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
