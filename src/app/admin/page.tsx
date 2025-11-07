"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  UserCheck,
  Building2,
  Clock,
  Download,
  Menu,
  X,
  Laptop
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useUsers } from "@/hooks/api/useUsers";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { useBookings } from "@/hooks/api/useBookings";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { getUserCount } = useUsers();
  const { filterCheckIns } = useCheckIns();
  const { getAdminBookings } = useBookings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalCheckIns: 0,
    totalBookings: 0,
    bookingsToday: 0,
    bookingsThisWeek: 0,
    averageCheckInTime: "N/A",
    averageCheckOutTime: "N/A",
    mostUsedFloor: "N/A",
    mostUsedProgramme: "N/A",
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    } else if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      // Get week start date
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      // Fetch all stats in parallel
      const [userCountResult, checkInsToday, allCheckIns, allBookings, bookingsToday, bookingsThisWeek] = await Promise.all([
        // Total users count
        getUserCount().catch(() => null),
        
        // Active check-ins today (status = checked_in, created today)
        filterCheckIns({
          status: 'checked_in',
          start_date: today.toISOString(),
          end_date: todayEnd.toISOString(),
        }).catch(() => []),
        
        // All check-ins (for total count)
        filterCheckIns({}).catch(() => []),
        
        // All bookings (for total count)
        getAdminBookings({}).catch(() => []),
        
        // Today's bookings
        getAdminBookings({
          booking_date: today.toISOString().split('T')[0],
        }).catch(() => []),
        
        // This week's bookings
        getAdminBookings({
          booking_date: weekStart.toISOString().split('T')[0],
        }).catch(() => []),
      ]);

      // Calculate active check-ins today (checked_in status)
      const activeCheckInsToday = checkInsToday.filter(
        ci => ci.status === 'checked_in'
      ).length;

      // Calculate average check-in/out times from today's check-ins
      let totalCheckInHours = 0;
      let totalCheckInMinutes = 0;
      let totalCheckOutHours = 0;
      let totalCheckOutMinutes = 0;
      let checkInCount = 0;
      let checkOutCount = 0;

      checkInsToday.forEach(checkIn => {
        if (checkIn.check_in_time) {
          const checkInTime = new Date(checkIn.check_in_time);
          totalCheckInHours += checkInTime.getHours();
          totalCheckInMinutes += checkInTime.getMinutes();
          checkInCount++;
        }
        if (checkIn.check_out_time) {
          const checkOutTime = new Date(checkIn.check_out_time);
          totalCheckOutHours += checkOutTime.getHours();
          totalCheckOutMinutes += checkOutTime.getMinutes();
          checkOutCount++;
        }
      });

      // Format average times
      const avgCheckInTime = checkInCount > 0
        ? `${Math.floor(totalCheckInHours / checkInCount)}:${String(Math.floor(totalCheckInMinutes / checkInCount)).padStart(2, '0')}`
        : "N/A";
      const avgCheckOutTime = checkOutCount > 0
        ? `${Math.floor(totalCheckOutHours / checkOutCount)}:${String(Math.floor(totalCheckOutMinutes / checkOutCount)).padStart(2, '0')}`
        : "N/A";

      // Calculate most used floor (from today's check-ins)
      const floorCounts: Record<string, number> = {};
      checkInsToday.forEach(ci => {
        if (ci.floor) {
          floorCounts[ci.floor] = (floorCounts[ci.floor] || 0) + 1;
        }
      });
      const mostUsedFloor = Object.keys(floorCounts).length > 0
        ? Object.entries(floorCounts).sort(([,a], [,b]) => b - a)[0][0]
        : "N/A";

      // Calculate most used programme (would need to fetch user data, using placeholder)
      const mostUsedProgramme = "N/A"; // TODO: Calculate from user data

      // Count bookings this week (filter by date range)
      const thisWeekBookings = bookingsThisWeek.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= weekStart && bookingDate <= todayEnd;
      });

      setStats({
        totalUsers: userCountResult || 0,
        activeToday: activeCheckInsToday,
        totalCheckIns: allCheckIns.length,
        totalBookings: allBookings.length,
        bookingsToday: bookingsToday.length,
        bookingsThisWeek: thisWeekBookings.length,
        averageCheckInTime: avgCheckInTime !== "N/A" ? `${avgCheckInTime} AM` : "N/A",
        averageCheckOutTime: avgCheckOutTime !== "N/A" ? `${avgCheckOutTime} PM` : "N/A",
        mostUsedFloor,
        mostUsedProgramme,
      });
    } catch (err: any) {
      // Error loading dashboard stats - stats will show defaults
      // Error could be displayed via error state if needed
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: TrendingUp },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Building Management", href: "/admin/buildings", icon: Building2 },
    { name: "Laptop Tracking", href: "/admin/laptops", icon: Laptop },
    { name: "Check-In History", href: "/admin/checkins", icon: UserCheck },
    { name: "Booking Management", href: "/admin/bookings", icon: Calendar },
    { name: "Reports", href: "/admin/reports", icon: Download },
  ];

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo and Menu */}
            <div className="flex items-center gap-3">
              <div className="relative w-32 h-12">
                <Image
                  src="https://ext.same-assets.com/2434544859/849502017.png"
                  alt="P-Connect"
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="relative w-20 h-8">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_O60OjGZ-JvEMg_5BRHor1H_aSpq_oNxXA&s"
                    alt="DSTI"
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-[72px]">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-xl lg:hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="relative w-32 h-14">
                <Image
                  src="https://ext.same-assets.com/2434544859/849502017.png"
                  alt="P-Connect"
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                />
              </div>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/admin";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1">Welcome to the P-Connect admin portal, {user?.first_name || 'Admin'}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoadingStats ? (
              <div className="col-span-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            ) : (
              <>
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Total</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
                  <div className="text-sm opacity-90">Registered Users</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <UserCheck className="w-8 h-8 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Today</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.activeToday}</div>
                  <div className="text-sm opacity-90">Active Check-Ins</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">All Time</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalCheckIns}</div>
                  <div className="text-sm opacity-90">Total Check-Ins</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Total</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalBookings}</div>
                  <div className="text-sm opacity-90">Total Bookings</div>
                </Card>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Today's Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Bookings Today</span>
                  <span className="font-semibold text-lg">{stats.bookingsToday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Bookings This Week</span>
                  <span className="font-semibold text-lg">{stats.bookingsThisWeek}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-lg">{stats.activeToday}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Usage Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Avg Check-In Time</span>
                  <span className="font-semibold text-lg">{stats.averageCheckInTime}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Avg Check-Out Time</span>
                  <span className="font-semibold text-lg">{stats.averageCheckOutTime}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Most Used Floor</span>
                  <span className="font-semibold text-lg">{stats.mostUsedFloor}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/buildings">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Building2 className="w-6 h-6" />
                  <span>Manage Buildings</span>
                </Button>
              </Link>
              <Link href="/admin/bookings">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                  <Calendar className="w-6 h-6" />
                  <span>Manage Bookings</span>
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700">
                  <Download className="w-6 h-6" />
                  <span>Download Reports</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Kiosk Access */}
          <Card className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200">
            <h3 className="text-lg font-semibold mb-3 text-teal-900">Visitor Kiosk</h3>
            <p className="text-teal-700 mb-4 text-sm">
              Open the visitor registration kiosk on a tablet at reception for walk-in visitors
            </p>
            <Link href="/kiosk/visitors/register" target="_blank">
              <Button className="w-full h-14 bg-teal-600 hover:bg-teal-700">
                <Users className="w-5 h-5 mr-2" />
                Open Visitor Kiosk (New Tab)
              </Button>
            </Link>
          </Card>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
