"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, Users, UserCheck, Phone, BarChart3, LogOut, FileText, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

interface UserData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  floor: string;
  block: string;
  laptop: string;
  assetNumber: string;
  photo: string;
  employeeId: string;
  isCheckedIn: boolean;
}

export default function SecurityCheckpointPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState({
    totalInBuilding: 0,
    employees: 0,
    visitors: 0,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debug: Log scannedUser state changes
  useEffect(() => {
    console.log("*** scannedUser state changed:", scannedUser);
    if (scannedUser) {
      console.log("✓ Modal should now be visible!");
    } else {
      console.log("✗ Modal is hidden (scannedUser is null)");
    }
  }, [scannedUser]);

  // Initialize QR scanner on mount
  useEffect(() => {
    loadStats();
    initializeScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.log("Audio not supported");
    }
  };

  const onScanSuccess = (decodedText: string) => {
    console.log("=== QR CODE SCANNED ===");
    console.log("Raw QR Data:", decodedText);

    playBeep();

    // Parse QR code data
    const userData = parseQRCode(decodedText);

    console.log("Parsed User Data:", userData);

    if (userData) {
      console.log("✓ User data found, setting scannedUser state");
      setScannedUser(userData);
      // Pause scanning while showing user info
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }
    } else {
      console.error("✗ parseQRCode returned null - modal will not open");
    }
  };

  const onScanFailure = () => {
    // Silent fail - normal when no QR code in view
  };

  const parseQRCode = (qrData: string): UserData | null => {
    try {
      console.log("--- parseQRCode START ---");
      console.log("QR Data:", qrData);

      // Check if this is a check-in QR code or booking QR code
      const isCheckIn = qrData.includes("/checkin");
      const isBooking = qrData.includes("/booking");

      console.log("isCheckIn:", isCheckIn, "isBooking:", isBooking);

      let employeeId = "";
      let qrDate = new Date().toISOString().split('T')[0];

      if (isCheckIn) {
        // Extract employee ID and date from check-in QR code
        const employeeIdMatch = qrData.match(/employeeId=([^&]+)/);
        const dateMatch = qrData.match(/date=([^&]+)/);

        console.log("employeeIdMatch:", employeeIdMatch);

        if (!employeeIdMatch) {
          console.error("✗ No employee ID found in check-in QR code");
          alert("Invalid QR code: No employee ID found");
          return null;
        }

        employeeId = employeeIdMatch[1];
        qrDate = dateMatch ? dateMatch[1] : qrDate;

        console.log("Extracted employeeId:", employeeId);
        console.log("Looking for key:", `checkin_${employeeId}`);

        // Get check-in data from localStorage
        const checkinDataStr = localStorage.getItem(`checkin_${employeeId}`);

        console.log("localStorage data:", checkinDataStr);

        if (!checkinDataStr) {
          console.error("✗ No check-in data found in localStorage for:", employeeId);
          console.log("All localStorage keys:", Object.keys(localStorage));
          alert("No user data found for this QR code. Please ensure the user has checked in.");
          return null;
        }

        const checkinData = JSON.parse(checkinDataStr);
        console.log("✓ Parsed check-in data:", checkinData);

        const userData: UserData = {
          name: checkinData.firstName,
          surname: checkinData.lastName,
          phone: checkinData.phone,
          email: checkinData.email,
          floor: checkinData.floor,
          block: checkinData.block,
          laptop: checkinData.laptop,
          assetNumber: checkinData.assetNumber,
          photo: `${checkinData.firstName.charAt(0).toUpperCase()}${checkinData.lastName.charAt(0).toUpperCase()}`,
          employeeId: employeeId,
          isCheckedIn: checkUserStatus(employeeId),
        };

        console.log("✓ Created userData object:", userData);
        console.log("--- parseQRCode END (SUCCESS) ---");
        return userData;

      } else if (isBooking) {
        console.log("Processing booking QR code");
        // For booking QR codes, try to get data from localStorage or use fallback
        const bookingIdMatch = qrData.match(/booking\/([^?]+)/);

        if (!bookingIdMatch) {
          console.error("✗ Invalid booking QR code");
          return null;
        }

        // For demo purposes, use currently logged-in user data if available
        const userEmail = sessionStorage.getItem("email");
        const firstName = sessionStorage.getItem("firstName") || "Booking";
        const lastName = sessionStorage.getItem("lastName") || "User";
        const phone = sessionStorage.getItem("phone") || "N/A";

        employeeId = `BOOK-${bookingIdMatch[1]}`;

        const userData: UserData = {
          name: firstName,
          surname: lastName,
          phone: phone,
          email: userEmail || "booking@example.com",
          floor: "Via Booking",
          block: "N/A",
          laptop: "N/A",
          assetNumber: "N/A",
          photo: `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`,
          employeeId: employeeId,
          isCheckedIn: checkUserStatus(employeeId),
        };

        console.log("✓ Created booking userData:", userData);
        console.log("--- parseQRCode END (SUCCESS) ---");
        return userData;
      } else {
        console.error("✗ Unknown QR code type - not /checkin or /booking");
        alert("Invalid QR code format");
        console.log("--- parseQRCode END (FAILURE) ---");
        return null;
      }
    } catch (err) {
      console.error("✗ Error parsing QR code:", err);
      alert("Error reading QR code. Please try again.");
      console.log("--- parseQRCode END (ERROR) ---");
      return null;
    }
  };

  const checkUserStatus = (employeeId: string): boolean => {
    const checkedInUsers = JSON.parse(sessionStorage.getItem("checkedInUsers") || "[]");
    return checkedInUsers.includes(employeeId);
  };

  const handleCheckIn = () => {
    if (!scannedUser) return;

    const checkedInUsers = JSON.parse(sessionStorage.getItem("checkedInUsers") || "[]");

    if (!checkedInUsers.includes(scannedUser.employeeId)) {
      checkedInUsers.push(scannedUser.employeeId);
      sessionStorage.setItem("checkedInUsers", JSON.stringify(checkedInUsers));

      setStats(prev => ({
        ...prev,
        totalInBuilding: prev.totalInBuilding + 1,
        employees: prev.employees + 1,
      }));

      // Show success notification
      setSuccessMessage(`✓ ${scannedUser.name} ${scannedUser.surname} CHECKED IN`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setSuccessMessage(`⚠️ ${scannedUser.name} ${scannedUser.surname} is already checked in`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    // Close modal immediately
    closeUserInfo();
  };

  const handleCheckOut = () => {
    if (!scannedUser) return;

    const checkedInUsers = JSON.parse(sessionStorage.getItem("checkedInUsers") || "[]");

    if (checkedInUsers.includes(scannedUser.employeeId)) {
      const updatedUsers = checkedInUsers.filter((id: string) => id !== scannedUser.employeeId);
      sessionStorage.setItem("checkedInUsers", JSON.stringify(updatedUsers));

      setStats(prev => ({
        ...prev,
        totalInBuilding: Math.max(0, prev.totalInBuilding - 1),
        employees: Math.max(0, prev.employees - 1),
      }));

      // Show success notification
      setSuccessMessage(`✓ ${scannedUser.name} ${scannedUser.surname} CHECKED OUT`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setSuccessMessage(`⚠️ ${scannedUser.name} ${scannedUser.surname} is not checked in`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    // Close modal immediately
    closeUserInfo();
  };

  const closeUserInfo = () => {
    setScannedUser(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const loadStats = () => {
    const checkedInUsers = JSON.parse(sessionStorage.getItem("checkedInUsers") || "[]");
    setStats({
      totalInBuilding: checkedInUsers.length,
      employees: checkedInUsers.length,
      visitors: 0,
    });
  };

  const handleLogout = () => {
    router.push("/security/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-[60] font-bold text-center animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Security Checkpoint</h1>
            <p className="text-xs text-gray-400">Building 41 - Main Entrance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="text-sm font-medium">Security Officer</p>
            <p className="text-xs text-gray-400">On Duty</p>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex flex-col">
        {/* Top Half - QR Scanner */}
        <div className="flex-1 bg-black relative">
          <div id="qr-reader" className="w-full h-full"></div>

          {/* Scanning Instructions */}
          {!scannedUser && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="bg-blue-600/90 text-white p-3 backdrop-blur">
                <p className="text-center text-sm font-medium">
                  🎯 Position QR Code in the scanning area
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Bottom Half - Controls & Stats */}
        <div className="bg-gray-800 p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-blue-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-xs font-medium">Total In Building</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalInBuilding}</p>
            </Card>
            <Card className="bg-green-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5" />
                <p className="text-xs font-medium">Employees</p>
              </div>
              <p className="text-3xl font-bold">{stats.employees}</p>
            </Card>
            <Card className="bg-orange-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-xs font-medium">Visitors</p>
              </div>
              <p className="text-3xl font-bold">{stats.visitors}</p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/security/phone-checkin">
              <Button className="w-full h-16 text-lg bg-primary hover:bg-primary/90 flex flex-col items-center justify-center gap-1">
                <Phone className="w-6 h-6" />
                <span className="text-sm">Phone Check-In</span>
              </Button>
            </Link>
            <Link href="/security/register">
              <Button className="w-full h-16 text-lg bg-gray-700 hover:bg-gray-600 flex flex-col items-center justify-center gap-1">
                <FileText className="w-6 h-6" />
                <span className="text-sm">View Register</span>
              </Button>
            </Link>
          </div>

          {/* Debug Test Button */}
          <Button
            onClick={() => {
              console.log("TEST BUTTON CLICKED");
              const testUser: UserData = {
                name: "Test",
                surname: "User",
                phone: "+27 82 123 4567",
                email: "test@example.com",
                floor: "Ground Floor",
                block: "Block A",
                laptop: "Dell Latitude",
                assetNumber: "TEST-001",
                photo: "TU",
                employeeId: "TEST-123",
                isCheckedIn: false
              };
              console.log("Setting scannedUser to:", testUser);
              setScannedUser(testUser);
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            🧪 TEST MODAL (Debug)
          </Button>
        </div>
      </div>

      {/* User Info Modal */}
      {scannedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md relative">
            <button
              onClick={closeUserInfo}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              {/* User Photo */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {scannedUser.photo}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {scannedUser.name} {scannedUser.surname}
                </h2>
                <p className="text-gray-400 text-sm">{scannedUser.email}</p>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 text-sm">Phone</span>
                  <span className="text-white font-medium">{scannedUser.phone}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 text-sm">Floor</span>
                  <span className="text-white font-medium">{scannedUser.floor}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 text-sm">Block</span>
                  <span className="text-white font-medium">{scannedUser.block}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 text-sm">Laptop</span>
                  <span className="text-white font-medium">{scannedUser.laptop}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400 text-sm">Asset Number</span>
                  <span className="text-white font-medium">{scannedUser.assetNumber}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6 p-3 bg-gray-700 rounded-lg text-center">
                <p className="text-gray-400 text-xs mb-1">Current Status</p>
                <p className={`font-bold text-lg ${scannedUser.isCheckedIn ? 'text-green-400' : 'text-gray-400'}`}>
                  {scannedUser.isCheckedIn ? '✓ CHECKED IN' : '○ NOT CHECKED IN'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCheckIn}
                  disabled={scannedUser.isCheckedIn}
                  className="h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  Check In
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!scannedUser.isCheckedIn}
                  className="h-14 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Check Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Side Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-gray-800 z-50 shadow-2xl">
            <div className="bg-gray-900 text-white p-4">
              <h2 className="text-lg font-bold">Security Menu</h2>
              <p className="text-xs text-gray-400">Officer Controls</p>
            </div>
            <div className="py-2">
              <Link
                href="/security/stats"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition-colors text-white"
              >
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Building Statistics</span>
              </Link>
              <Link
                href="/security/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition-colors text-white"
              >
                <FileText className="w-5 h-5 text-green-400" />
                <span>Check-In Register</span>
              </Link>
              <Link
                href="/security/visitors"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition-colors text-white"
              >
                <Users className="w-5 h-5 text-orange-400" />
                <span>Visitor Register</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 hover:bg-red-700 transition-colors w-full text-left text-white"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
