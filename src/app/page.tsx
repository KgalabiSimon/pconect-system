"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Bell, LogIn, Calendar, BarChart3, HelpCircle, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [userName, setUserName] = useState("");
  const [upcomingBookings, setUpcomingBookings] = useState<Array<{
    id: string;
    space: string;
    building: string | number;
    date: string;
    time: string;
  }>>([]);
  const [hasActiveCheckIn, setHasActiveCheckIn] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);

  useEffect(() => {
    // Check if user is logged in (simple check using sessionStorage)
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);

      // Get user's name from sessionStorage
      const firstName = sessionStorage.getItem("firstName") || "";
      const lastName = sessionStorage.getItem("lastName") || "";
      const fullName = `${firstName} ${lastName}`.trim();
      setUserName(fullName || "User");

      // Check for active check-in QR code
      const today = new Date().toISOString().split('T')[0];
      const userEmail = sessionStorage.getItem("email") || "user@example.com";
      const qrCodeKey = `qr_checkin_${userEmail}_${today}`;
      const qrData = sessionStorage.getItem(qrCodeKey);

      if (qrData) {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(23, 59, 59, 999);
        if (now < midnight) {
          setHasActiveCheckIn(true);
        }
      }

      // Check if notification was dismissed today
      const dismissedDate = sessionStorage.getItem("notificationDismissedDate");
      if (dismissedDate === today) {
        setShowNotification(false);
      } else {
        setShowNotification(true);
      }

      // Check for upcoming bookings
      checkUpcomingBookings(today);
    }
  }, [router]);

  const checkUpcomingBookings = (todayStr: string) => {
    // In real app, this would fetch from API
    // For demo, check for sample bookings for today and next 3 days
    const today = new Date(todayStr);

    // Sample upcoming bookings (in real app, fetch from API or sessionStorage)
    const sampleBookings = [
      {
        id: "BK-UPCOMING1",
        space: "Hot Desk 101",
        building: 41,
        date: todayStr,
        time: "09:00 - 17:00",
        type: "desk"
      },
    ];

    // Filter bookings for today and next 3 days
    const upcoming: typeof upcomingBookings = [];
    sampleBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const diffTime = bookingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        upcoming.push(booking);
      }
    });

    setUpcomingBookings(upcoming);

    // Also check for today's booking
    const todayBooking = upcoming.find(b => b.date === todayStr);
    if (todayBooking) {
      setHasActiveBooking(true);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    // Save dismissal state with today's date so it shows again tomorrow
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem("notificationDismissedDate", today);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsMenuOpen(false);
    router.push("/login");
  };

  const sideMenuItems = [
    {
      title: "Messages",
      icon: Bell,
      href: "/settings/notifications",
    },
    {
      title: "Check-ins",
      icon: LogIn,
      href: "/checkin",
    },
    {
      title: "Check-in History",
      icon: BarChart3,
      href: "/checkin/history",
    },
    {
      title: "Bookings",
      icon: Calendar,
      href: "/bookings/mine",
    },
    {
      title: "Booking History",
      icon: BarChart3,
      href: "/bookings/history",
    },
    {
      title: "Support",
      icon: HelpCircle,
      href: "/support",
    },
  ];

  const gridMenuItems: Array<{
    title: string;
    icon: string;
    href?: string;
  }> = [
    {
      title: "Check-in/out",
      icon: "https://ext.same-assets.com/2434544859/1498012252.png",
      href: "/checkin",
    },
    {
      title: "Bookings",
      icon: "office-chair", // Using Lucide icon
      href: "/bookings/mine",
    },
    {
      title: "Resources",
      icon: "https://ext.same-assets.com/2434544859/1617492555.png",
    },
    {
      title: "Notifications",
      icon: "bell", // Using Lucide icon
      href: "/settings/notifications",
    },
    {
      title: "Policies",
      icon: "https://ext.same-assets.com/2434544859/345649155.png",
    },
    {
      title: "Wellness",
      icon: "https://ext.same-assets.com/2434544859/1462153959.png",
    },
  ];

  if (!isLoggedIn) {
    return null; // Don't render anything while checking login status
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-3 px-3 md:py-6 md:px-16">
      {/* Header with Hamburger and Profile */}
      <div className="w-full flex justify-between items-center mb-2 md:mb-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>

        {/* Profile Section with Name */}
        <Link href="/profile" className="flex items-center gap-2 md:gap-3 p-2 rounded-full hover:bg-primary/5 transition-colors active:scale-95">
          <span className="text-sm md:text-base font-medium text-gray-700 max-w-[120px] md:max-w-[200px] truncate">
            {userName}
          </span>
          <div className="p-1.5 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Logo Header */}
      <div className="w-full flex justify-center mb-3 md:mb-4">
        <div className="relative w-24 h-24 md:w-48 md:h-48">
          <Image
            src="https://ext.same-assets.com/2434544859/1264356430.png"
            alt="P Connect Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Booking Notifications Strip */}
      {showNotification && upcomingBookings.length > 0 && (
        <div className="w-full max-w-3xl mb-4 md:mb-6 px-1">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-4 md:p-5 relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleCloseNotification}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {upcomingBookings.length === 1
                    ? "You have an upcoming booking"
                    : `You have ${upcomingBookings.length} upcoming bookings`}
                </h3>

                {upcomingBookings.slice(0, 2).map((booking, index) => (
                  <div key={booking.id} className={`text-sm text-gray-700 ${index > 0 ? 'mt-2' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{booking.space}</span>
                      <span className="text-gray-500">•</span>
                      <span>Building {booking.building}</span>
                      <span className="text-gray-500">•</span>
                      <span>{booking.date === new Date().toISOString().split('T')[0] ? 'Today' : booking.date}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{booking.time}</div>
                  </div>
                ))}

                {upcomingBookings.length > 2 && (
                  <p className="text-xs text-blue-600 mt-2">
                    +{upcomingBookings.length - 2} more booking{upcomingBookings.length - 2 > 1 ? 's' : ''}
                  </p>
                )}

                {/* Action button */}
                <Link href="/bookings/mine">
                  <Button
                    size="sm"
                    className="mt-3 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    View All Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-3xl flex-1 px-1">
        <div className="grid grid-cols-2 gap-3 md:gap-8 mb-6 md:mb-10">
          {gridMenuItems.map((item, index) => {
            const content = (
              <Card className="flex flex-col items-center justify-center p-4 md:p-10 bg-white shadow-md hover:shadow-xl rounded-2xl md:rounded-3xl border-0 h-full min-h-[120px] md:min-h-[180px] transition-shadow">
                <div className="w-14 h-14 md:w-24 md:h-24 relative mb-2 md:mb-5 flex items-center justify-center">
                  {item.icon === "office-chair" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="w-full h-full text-primary"
                      fill="currentColor"
                    >
                      <path d="M50 20c-8 0-15 5-15 12v8h30v-8c0-7-7-12-15-12z"/>
                      <rect x="30" y="40" width="40" height="15" rx="2"/>
                      <rect x="35" y="55" width="5" height="15"/>
                      <rect x="60" y="55" width="5" height="15"/>
                      <path d="M45 70h10v5h-10z"/>
                      <circle cx="40" cy="78" r="3"/>
                      <circle cx="60" cy="78" r="3"/>
                      <circle cx="35" cy="82" r="2"/>
                      <circle cx="45" cy="82" r="2"/>
                      <circle cx="55" cy="82" r="2"/>
                      <circle cx="65" cy="82" r="2"/>
                      <rect x="28" y="48" width="3" height="12" transform="rotate(-20 29.5 54)"/>
                      <rect x="69" y="48" width="3" height="12" transform="rotate(20 70.5 54)"/>
                    </svg>
                  ) : item.icon === "bell" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="w-full h-full text-primary"
                      fill="currentColor"
                    >
                      <path d="M50 15c-3 0-5.5 2.5-5.5 5.5v2c-8 2-14 9-14 17.5v12c0 3-1 6-3 8l-2 2v3h49v-3l-2-2c-2-2-3-5-3-8v-12c0-8.5-6-15.5-14-17.5v-2c0-3-2.5-5.5-5.5-5.5z"/>
                      <path d="M43 70c0 4 3 7 7 7s7-3 7-7"/>
                      <circle cx="70" cy="25" r="8" fill="#ef4444"/>
                    </svg>
                  ) : (
                    <Image
                      src={item.icon}
                      alt={item.title}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <span className="text-xs md:text-lg font-medium text-primary/80 text-center leading-tight">
                  {item.title}
                </span>
              </Card>
            );

            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group transition-all hover:scale-105 active:scale-95"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={index}
                className="group transition-all hover:scale-105 active:scale-95"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="w-full max-w-3xl px-4 md:px-8 mb-4 md:mb-5">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="w-full text-sm md:text-lg font-bold border-2 border-primary/60 text-primary hover:bg-primary/5 hover:border-primary transition-all rounded-xl md:rounded-2xl h-12 md:h-16 tracking-wide"
        >
          LOGOUT
        </Button>
      </div>

      {/* Client Badge */}
      <div className="w-full max-w-3xl px-4 md:px-8 mb-4 md:mb-5">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-gray-200 rounded-2xl p-3 md:p-5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">
                Proudly serving
              </p>
              <p className="text-sm md:text-base font-bold text-primary">
                Department of Science, Technology and Innovation
              </p>
            </div>
            <div className="relative w-32 h-16 md:w-40 md:h-20">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_O60OjGZ-JvEMg_5BRHor1H_aSpq_oNxXA&s"
                alt="DSTI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform">
            {/* Menu Header */}
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">P-Connect</h2>
                <p className="text-xs text-white/80">Menu</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {sideMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-colors border-b border-gray-100"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-base font-medium text-gray-700">
                      {item.title}
                    </span>
                  </Link>
                );
              })}

              {/* Logout Button in Menu */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors w-full text-left border-b border-gray-100"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-base font-medium text-red-600">
                  Logout
                </span>
              </button>
            </div>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t">
              <p className="text-xs text-gray-500 text-center">
                P-Connect System v1.0
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
