/**
 * Navigation Component
 * Displays navigation with authentication-aware content
 */

'use client';

import { Button } from "@/components/ui/button";
import { Menu, X, Bell, LogIn, Calendar, BarChart3, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { UserProfile } from "./UserProfile";

interface NavigationProps {
  showNotification?: boolean;
  onNotificationClose?: () => void;
}

export function Navigation({ showNotification = true, onNotificationClose }: NavigationProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNotificationClose = () => {
    if (onNotificationClose) {
      onNotificationClose();
    }
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <img
                src="https://ext.same-assets.com/2434544859/849502017.png"
                alt="P-Connect Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-gray-900">P-Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                  Bookings
                </Link>
                <Link href="/checkin" className="text-gray-600 hover:text-gray-900">
                  Check-in
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                <UserProfile compact={true} />
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/bookings" 
                  className="block text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bookings
                </Link>
                <Link 
                  href="/checkin" 
                  className="block text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Check-in
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <UserProfile compact={false} />
                </div>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {showNotification && isAuthenticated && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Welcome back, {user?.first_name}! Your workspace is ready.
              </span>
            </div>
            <button
              onClick={handleNotificationClose}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
