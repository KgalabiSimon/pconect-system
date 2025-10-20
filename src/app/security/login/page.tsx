"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecurityLoginPage() {
  const router = useRouter();
  const [badge, setBadge] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!badge.trim() || !pin.trim()) {
      alert("Please enter badge number and PIN");
      return;
    }
    // In real app, validate against security database
    sessionStorage.setItem("securityLoggedIn", "true");
    sessionStorage.setItem("securityBadge", badge);
    router.push("/security");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Security Checkpoint</h1>
          <p className="text-gray-400 text-sm">Officer Login Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Badge Number</label>
            <Input
              type="text"
              placeholder="Enter badge number"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="h-14 text-base bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-white text-sm font-medium">PIN</label>
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="h-14 text-base bg-gray-700 border-gray-600 text-white pr-12"
                required
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Login to Checkpoint
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Authorized Security Personnel Only
          </p>
        </div>
      </Card>
    </div>
  );
}
