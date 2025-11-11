"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, Users, UserCheck, Phone, BarChart3, LogOut, FileText, X, Camera } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/hooks/api/useAuth";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { apiClient } from "@/lib/api/client";
import { userService } from "@/lib/api/users";
import { checkInsService } from "@/lib/api/checkins";
import type { CheckInResponse } from "@/types/api";

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
  const { user: securityOfficer, isAuthenticated, isLoading: authLoading, logout, token } = useAuth();
  const { verifyQR, checkOut: checkOutUser, getCheckInStatus, isLoading: verifying, isUpdating: isCheckingOut } = useCheckIns();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<UserData | null>(null);
  const [scannedCheckIn, setScannedCheckIn] = useState<CheckInResponse | null>(null);
  const lastScannedIdRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0); // Track last scanned QR to prevent duplicates
  const [stats, setStats] = useState({
    totalInBuilding: 0,
    employees: 0,
    visitors: 0,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/security/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Ensure token is synced to API client when page loads or token changes
  useEffect(() => {
    if (isAuthenticated && token) {
      const currentApiToken = apiClient.getAuthToken();
      if (token !== currentApiToken) {
        console.log("🔄 Syncing auth token to API client on security page load");
        apiClient.setAuthToken(token);
      }
    }
  }, [isAuthenticated, token]);

  // Debug: Log scannedUser state changes
  useEffect(() => {
    console.log("*** scannedUser state changed:", scannedUser);
    if (scannedUser) {
      console.log("✓ Modal should now be visible!");
    } else {
      console.log("✗ Modal is hidden (scannedUser is null)");
    }
  }, [scannedUser]);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Request camera permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        
        console.log('📷 Available cameras:', videoDevices.map(d => ({ id: d.deviceId, label: d.label })));
        
        // Auto-select external webcam (usually has "USB" in name or longer label)
        if (videoDevices.length > 0 && !selectedCameraId) {
          const externalCam = videoDevices.find(device => 
            device.label.toLowerCase().includes('usb') || 
            device.label.toLowerCase().includes('webcam') ||
            device.label.length > 20 // External cams usually have longer names
          );
          if (externalCam && externalCam.deviceId) {
            setSelectedCameraId(externalCam.deviceId);
            console.log('🎥 Auto-selected external camera:', externalCam.label);
          } else {
            // Fallback to first available camera
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };

    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      getCameras();
      // Re-enumerate after permissions are granted
      navigator.mediaDevices.addEventListener('devicechange', getCameras);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getCameras);
      };
    }
  }, []);

  // Initialize QR scanner after authentication and DOM is ready
  useEffect(() => {
    // Don't initialize if still loading auth or not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    loadStats();
    
    // Wait for the DOM element and camera selection to be available
    const timer = setTimeout(() => {
      const element = document.getElementById("qr-reader");
      if (element) {
        // Only initialize if we have cameras detected or can fallback
        if (availableCameras.length > 0 || !selectedCameraId) {
          initializeScanner();
        }
      } else {
        console.error("QR reader element not found, retrying...");
        // Retry after a short delay
        setTimeout(() => {
          const retryElement = document.getElementById("qr-reader");
          if (retryElement) {
            if (availableCameras.length > 0 || !selectedCameraId) {
              initializeScanner();
            }
          } else {
            console.error("QR reader element still not found after retry");
          }
        }, 500);
      }
    }, 200); // Slightly longer delay to ensure cameras are enumerated

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [authLoading, isAuthenticated, selectedCameraId, availableCameras.length]);

  const initializeScanner = async () => {
    try {
      // Stop any existing scanner first (if running)
      if (scannerRef.current) {
        try {
          // Only try to stop if we know it's scanning
          if (isScanning) {
            await stopScanner();
            // Wait a bit for scanner to fully stop before starting new one
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            // Just clear the reference if not scanning
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        } catch (stopErr: any) {
          // If scanner is not running, that's okay - just clear and continue
          if (stopErr.message?.includes('not running') || 
              stopErr.message?.includes('not running or paused') ||
              stopErr.message?.includes('transition')) {
            // Expected error - scanner wasn't running, just clear reference
            scannerRef.current = null;
          } else {
            console.warn('Warning stopping scanner:', stopErr);
            scannerRef.current = null;
          }
        }
      }
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        // Square QR scanning box - fixed size for consistent square shape
        // Using fixed pixel values for reliable scanning
        qrbox: { width: 250, height: 250 }, // Fixed square size (250x250 pixels) - larger for better detection
        aspectRatio: 1.0, // 1:1 aspect ratio for perfect square
      };

      // Use selected camera ID if available, otherwise fallback to facingMode
      const cameraConfig = selectedCameraId 
        ? { deviceId: { exact: selectedCameraId } } // Use specific camera
        : { facingMode: "environment" }; // Fallback: use back camera

      console.log('📷 Starting scanner with camera:', selectedCameraId || 'environment mode');
      console.log('📷 Scanner config:', { fps: config.fps, qrbox: config.qrbox, aspectRatio: config.aspectRatio });
      
      await html5QrCode.start(
        cameraConfig,
        config,
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
      console.log('✅ Scanner started successfully');
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      // If specific camera fails, try fallback
      if (selectedCameraId && err.message?.includes('deviceId')) {
        console.log('⚠️ Selected camera failed, trying environment mode...');
        setSelectedCameraId(null); // Reset to use default
        setTimeout(() => initializeScanner(), 500);
      } else {
        alert("Could not access camera. Please check permissions.");
      }
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    // Restart scanner with new camera
    if (isScanning) {
      await initializeScanner();
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        // Try to stop the scanner - catch errors if it's not running
        try {
          await scannerRef.current.stop();
        } catch (stopErr: any) {
          // Ignore "not running" and transition errors - these are expected
          if (!stopErr.message?.includes('not running') && 
              !stopErr.message?.includes('not running or paused') &&
              !stopErr.message?.includes('transition')) {
            console.warn("Scanner stop warning:", stopErr.message);
          }
        }
        
        // Always try to clear
        try {
          scannerRef.current.clear();
        } catch (clearErr) {
          // Ignore clear errors
        }
        
        setIsScanning(false);
      } catch (err: any) {
        // Ignore "not running" and transition errors
        if (!err.message?.includes('not running') && 
            !err.message?.includes('not running or paused') &&
            !err.message?.includes('transition')) {
          console.error("Error stopping scanner:", err);
        }
        setIsScanning(false);
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
      
      // Schedule stop and cleanup
      const stopTime = audioContext.currentTime + 0.2;
      oscillator.stop(stopTime);
      
      // Clean up audio context after sound completes to prevent memory leaks
      oscillator.onended = () => {
        try {
          audioContext.close();
        } catch (closeErr) {
          // Ignore cleanup errors
        }
      };
    } catch (err: any) {
      // Silently ignore audio errors (e.g., if page is closing or audio not supported)
      if (!err.message?.includes('interrupted') && !err.message?.includes('removed from the document')) {
        // Only log non-interruption errors
      }
    }
  };

  const onScanSuccess = async (decodedText: string, decodedResult?: any) => {
    console.log("=== QR CODE SCANNED ===");
    console.log("Raw QR Data:", decodedText);
    console.log("Decoded Result:", decodedResult);

    // PAUSE IMMEDIATELY to prevent multiple scans of the same QR code
    // Do this before any async operations to minimize race conditions
    if (scannerRef.current && isScanning) {
      try {
        scannerRef.current.pause(true);
        console.log("⏸️ Scanner paused immediately");
      } catch (pauseErr: any) {
        // Ignore pause errors - scanner might already be paused
        if (!pauseErr.message?.includes('already paused') && 
            !pauseErr.message?.includes('not running')) {
          console.warn("Warning pausing scanner:", pauseErr.message);
        }
      }
    }

    setErrorMessage(null);

    try {
      // html5-qrcode library can sometimes pass data in decodedResult instead of decodedText
      // Check decodedResult first, then fallback to decodedText
      let qrString: string;
      
      // First, check if decodedResult has the actual data
      if (decodedResult?.decodedText && typeof decodedResult.decodedText === 'string') {
        qrString = decodedResult.decodedText;
      } else if (decodedResult?.result?.text && typeof decodedResult.result.text === 'string') {
        qrString = decodedResult.result.text;
      } else if (typeof decodedText === 'string') {
        qrString = decodedText;
      } else {
        // Handle non-string decodedText
        if (typeof decodedText === 'object' && decodedText !== null) {
          const obj = decodedText as any;
          // Try to get text from result object if it has one
          if (obj.text && typeof obj.text === 'string') {
            qrString = obj.text;
          } else if (obj.decodedText && typeof obj.decodedText === 'string') {
            qrString = obj.decodedText;
          } else {
            // Last resort: stringify the object
            qrString = JSON.stringify(decodedText);
            console.warn("QR code returned object, converting to string:", qrString);
          }
        } else {
          qrString = String(decodedText);
        }
      }
      
      // Check if we got "[object Object]" which means the QR code was generated incorrectly
      if (qrString === "[object Object]" || qrString.trim() === "[object Object]") {
        setErrorMessage("Invalid QR code format. This QR code appears to be corrupted. Please regenerate it from the check-in page.");
        // Resume scanning after a delay
        setTimeout(() => {
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
          lastScannedIdRef.current = null; // Clear so user can try a different QR code
          lastScanTimeRef.current = 0; // Reset timestamp
        }, 2000);
        return;
      }

      // If it's a JSON string, try to parse it
      if (qrString.trim().startsWith('{') || qrString.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(qrString);
          // If it has a checkin_id or id field, use that
          if (parsed.checkin_id) {
            qrString = parsed.checkin_id;
          } else if (parsed.id) {
            qrString = parsed.id;
          } else if (parsed.data) {
            qrString = parsed.data;
          }
          console.log("Parsed JSON from QR code:", parsed, "Using:", qrString);
        } catch (e) {
          // Not valid JSON, use as-is
          console.log("QR code is not JSON, using as string");
        }
      }

      // Extract check-in ID from QR code
      // New API format: QR code string IS the check-in ID (UUID)
      // Old format: URL with data and employeeId parameters
      let checkinId = qrString.trim();

      // Check if it's the old URL format
      if (qrString.includes("/checkin") || qrString.includes("employeeId=")) {
        // Extract check-in ID from the data parameter or employeeId
        const dataMatch = qrString.match(/data=([^&]+)/);
        const employeeIdMatch = qrString.match(/employeeId=([^&]+)/);
        
        if (dataMatch) {
          // The data parameter contains the check-in ID (new format)
          checkinId = decodeURIComponent(dataMatch[1]);
          console.log("Extracted check-in ID from data parameter:", checkinId);
        } else if (employeeIdMatch) {
          // Old format - employeeId is not the check-in ID, need to look up
          setErrorMessage("This QR code uses an old format. Please regenerate it from the check-in page.");
          // Resume scanning after a delay
          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.resume();
            }
            lastScannedIdRef.current = null; // Clear so user can try a different QR code
          lastScanTimeRef.current = 0; // Reset timestamp
          }, 2000);
          return;
        } else {
          setErrorMessage("Could not extract check-in ID from QR code format.");
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
          return;
        }
      }

      // Validate that checkinId looks like a UUID (basic validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(checkinId)) {
        console.warn("❌ Check-in ID doesn't look like a UUID:", checkinId);
        console.warn("⚠️ This QR code appears to be using an old format or was generated incorrectly.");
        console.warn("⚠️ The QR code should contain a UUID (check-in ID), not just a number.");
        
        // If it's just a number, it's likely an old format or incorrect API response
        if (/^\d+$/.test(checkinId)) {
          setErrorMessage(`Invalid QR code: The API returned a numeric ID (${checkinId}) instead of a UUID. This QR code needs to be regenerated. Please ask the user to create a new check-in from the check-in page.`);
        } else {
          setErrorMessage(`Invalid QR code format: "${checkinId}". Expected a UUID format (e.g., abc123-def456-...). Please scan a valid check-in QR code or ask the user to regenerate it.`);
        }
        
        // Resume scanning after a delay
        setTimeout(() => {
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
          lastScannedIdRef.current = null; // Clear so user can try a different QR code
          lastScanTimeRef.current = 0; // Reset timestamp
        }, 3000); // Longer delay so user can read the error
        return;
      }

      // PREVENT DUPLICATE SCANS: Check if we just scanned this same QR code
      // Also add a time-based debounce (ignore scans within 2 seconds)
      const now = Date.now();
      const timeSinceLastScan = now - lastScanTimeRef.current;
      
      if (lastScannedIdRef.current === checkinId || timeSinceLastScan < 2000) {
        if (lastScannedIdRef.current === checkinId) {
          console.log("⚠️ Duplicate scan detected (same ID), ignoring:", checkinId);
        } else {
          console.log(`⚠️ Rapid scan detected (${timeSinceLastScan}ms ago), ignoring to prevent duplicates`);
        }
        return; // Don't process again - scanner should remain paused
      }
      
      // Mark this QR code as scanned with timestamp
      lastScannedIdRef.current = checkinId;
      lastScanTimeRef.current = now;
      console.log("📝 Processing new QR code:", checkinId);

      // Verify QR code with API
      if (!securityOfficer?.id) {
        setErrorMessage("Security officer ID not found. Please log in again.");
        // Resume scanner after error
        setTimeout(() => {
          if (scannerRef.current && isScanning) {
            try {
              scannerRef.current.resume();
            } catch (resumeErr: any) {
              // Ignore resume errors if scanner is not paused
              if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                console.warn("Warning resuming scanner:", resumeErr);
              }
            }
          }
        }, 500);
        return;
      }

      console.log("📊 Processing QR code with checkinId:", checkinId);
      
      // CRITICAL: Ensure token is synced before making the request
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pconnect_auth_token') : null;
      const currentApiToken = apiClient.getAuthToken();
      const authContextToken = token;
      
      // Prioritize auth context token, then localStorage, then current API client token
      let tokenToUse = null;
      if (authContextToken) {
        tokenToUse = authContextToken;
      } else if (storedToken) {
        tokenToUse = storedToken;
      } else if (currentApiToken) {
        tokenToUse = currentApiToken;
      }
      
      // Always sync the best available token to API client
      if (tokenToUse) {
        if (tokenToUse !== currentApiToken) {
          console.log("🔄 Re-syncing token to API client");
          apiClient.setAuthToken(tokenToUse);
        }
      } else {
        console.error("❌ No token available! User may need to log in again.");
        setErrorMessage("Authentication token not found. Please log in again.");
        setTimeout(() => {
          if (scannerRef.current && isScanning) {
            try {
              scannerRef.current.resume();
            } catch (resumeErr: any) {
              if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                console.warn("Warning resuming scanner:", resumeErr);
              }
            }
          }
        }, 500);
        return;
      }

      // STEP 1: FIRST check the status of the check-in
      // This tells us if user is checked_in (can checkout) or pending (can verify/checkin)
      console.log("📊 Step 1: Checking check-in status for:", checkinId);
      let statusResponse = null;
      
      try {
        statusResponse = await getCheckInStatus(checkinId);
        
        if (!statusResponse) {
          throw new Error("Failed to get check-in status");
        }
        
        console.log("✅ Check-in status retrieved:", statusResponse);
        console.log("   - Status:", statusResponse.status);
        console.log("   - User ID:", statusResponse.user_id);
        console.log("   - Floor:", statusResponse.floor);
        console.log("   - Block:", statusResponse.block);
      } catch (statusError: any) {
        console.error("❌ Failed to get check-in status:", statusError);
        
        // If status check fails, we can't proceed safely
        // Try checkout as fallback (might work if user is checked_in)
        if (statusError?.status === 404) {
          setErrorMessage("Check-in not found. This QR code may be invalid or expired.");
        } else if (statusError?.status === 403) {
          setErrorMessage("Access denied. You may not have permission to view this check-in.");
        } else {
          setErrorMessage(statusError?.message || "Failed to verify QR code. Please try again.");
        }
        
        setTimeout(() => {
          if (scannerRef.current && isScanning) {
            try {
              scannerRef.current.resume();
            } catch (resumeErr: any) {
              if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                console.warn("Warning resuming scanner:", resumeErr);
              }
            }
          }
          lastScannedIdRef.current = null;
          lastScanTimeRef.current = 0;
        }, 3000);
        return;
      }

      // STEP 2: Handle based on status
      const checkInStatus = statusResponse.status;
      const userId = statusResponse.user_id;
      const checkinIdFromResult = statusResponse.checkin_id || checkinId;
      
      // Use rich data from status response
      const floor = statusResponse.floor || "Not Available";
      const block = statusResponse.block || "Not Available";
      const laptop = statusResponse.laptop_model || "Not Available";
      const assetNumber = statusResponse.laptop_asset_number || "Not Available";

      if (checkInStatus === "checked_in") {
        // User is checked in - automatically checkout
        console.log("🔄 User is checked in - automatically checking out...");
        
        try {
          const checkoutResult = await checkOutUser(checkinIdFromResult);
          
          if (checkoutResult) {
            console.log("✅ Auto checkout successful!");
            setSuccessMessage("✓ User checked out successfully");
            
            // Update local stats
            setStats(prev => ({
              ...prev,
              totalInBuilding: Math.max(0, prev.totalInBuilding - 1),
              employees: Math.max(0, prev.employees - 1),
            }));
            
            // Resume scanning after showing success message
            setTimeout(() => {
              setSuccessMessage(null);
              if (scannerRef.current && isScanning) {
                try {
                  scannerRef.current.resume();
                } catch (resumeErr: any) {
                  if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                    console.warn("Warning resuming scanner:", resumeErr);
                  }
                }
              }
              lastScannedIdRef.current = null;
              lastScanTimeRef.current = 0;
            }, 2000);
            return; // Exit - don't show modal, user is checked out
          }
        } catch (checkoutErr: any) {
          console.error("❌ Auto checkout failed:", checkoutErr);
          setErrorMessage(checkoutErr.message || "Failed to check out. Please try again.");
          setTimeout(() => {
            setErrorMessage(null);
            if (scannerRef.current && isScanning) {
              try {
                scannerRef.current.resume();
              } catch (resumeErr: any) {
                if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                  console.warn("Warning resuming scanner:", resumeErr);
                }
              }
            }
            lastScannedIdRef.current = null;
            lastScanTimeRef.current = 0;
          }, 3000);
          return;
        }
      } else if (checkInStatus === "checked_out") {
        // User is checked out - QR code is reusable, allow them to check back in
        // This allows the same QR code to be used for multiple check-in/check-out cycles until it expires at midnight
        console.log("🔄 User is checked out - allowing re-check-in with same QR code");
        
        try {
          // Call verifyQR to check them back in (reusing the same QR code)
          const checkInResult = await verifyQR(checkinIdFromResult, securityOfficer.id);

          if (checkInResult) {
            console.log("✓ Re-check-in successful - user is now checked in again");
            
            // Try to fetch user data (may fail with 403 for security officers, which is expected)
            let userInfo = null;
            if (userId) {
              try {
                userInfo = await userService.getUserById(userId, { suppressErrorLog: true });
                console.log("✅ User data fetched successfully!");
              } catch (userError: any) {
                // Handle 403 gracefully - security officers don't have permission to view user details
                if (userError?.status === 403) {
                  console.log("ℹ️ Security officer does not have permission to view user details (expected)");
                } else {
                  console.error("❌ Failed to fetch user data:", userError);
                }
              }
            }
            
            // Extract user name from fetched data or use fallback
            const hasUserDetails = !!userInfo && (userInfo.first_name || userInfo.last_name || userInfo.email);
            let firstName = userInfo?.first_name || "";
            let lastName = userInfo?.last_name || "";
            
            // If we have user info but no name, try to extract from email
            if (!firstName && !lastName && hasUserDetails && userInfo?.email) {
              const emailName = userInfo.email.split('@')[0];
              firstName = emailName.split('.')[0] || emailName;
              lastName = emailName.split('.')[1] || "";
            }
            
            // Final fallback
            if (!firstName && !lastName) {
              if (hasUserDetails && userInfo?.email) {
                firstName = userInfo.email.split('@')[0];
              } else {
                firstName = "Verified";
                lastName = userId ? `User ID: ${userId.substring(0, 8)}` : "User";
              }
            }
            
            const userPhone = userInfo?.phone || (hasUserDetails ? "Not Available" : "Limited Access");
            const userEmail = userInfo?.email || (hasUserDetails ? "Not Available" : `User ID: ${userId?.substring(0, 8) || 'N/A'}...`);
            
            // Create check-in response object for modal
            const finalCheckInData: CheckInResponse = {
              id: checkinIdFromResult,
              check_in_time: new Date().toISOString(),
              status: 'checked_in' as const,
              user_id: userId,
              floor: floor,
              block: block,
              laptop_model: laptop,
              laptop_asset_number: assetNumber,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Convert to UserData format for display
            const userData: UserData = {
              name: firstName,
              surname: lastName,
              phone: userPhone,
              email: userEmail,
              floor: floor,
              block: block,
              laptop: laptop,
              assetNumber: assetNumber,
              photo: firstName !== "Unknown" && lastName !== "Unknown" 
                ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}` 
                : "UU",
              employeeId: userId || "",
              isCheckedIn: true, // User was checked out, now checked in again
            };

            console.log("✅ Final userData for display:", userData);
            setScannedUser(userData);
            setScannedCheckIn(finalCheckInData);
            // Scanner remains paused - will resume when user closes modal or clears scan
            
            // Update local stats
            setStats(prev => ({
              ...prev,
              totalInBuilding: prev.totalInBuilding + 1,
              employees: prev.employees + 1,
            }));
          } else {
            setErrorMessage("Failed to check back in. Please try again.");
            setTimeout(() => {
              if (scannerRef.current && isScanning) {
                try {
                  scannerRef.current.resume();
                } catch (resumeErr: any) {
                  if (!resumeErr.message?.includes('not paused') && 
                      !resumeErr.message?.includes('not running')) {
                    console.warn("Warning resuming scanner:", resumeErr);
                  }
                }
              }
              lastScannedIdRef.current = null;
              lastScanTimeRef.current = 0;
            }, 2000);
          }
        } catch (verifyQRError: any) {
          console.error("❌ Re-check-in failed:", verifyQRError);
          
          // If verifyQR fails because check-in can't be reactivated, show appropriate message
          if (verifyQRError?.status === 400 && 
              (verifyQRError?.message?.includes("not pending") || 
               verifyQRError?.message?.includes("already processed"))) {
            setErrorMessage("This check-in cannot be reactivated. Please create a new check-in.");
          } else {
            setErrorMessage(verifyQRError.message || "Failed to check back in. Please try again.");
          }
          
          setTimeout(() => {
            if (scannerRef.current && isScanning) {
              try {
                scannerRef.current.resume();
              } catch (resumeErr: any) {
                if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                  console.warn("Warning resuming scanner:", resumeErr);
                }
              }
            }
            lastScannedIdRef.current = null;
            lastScanTimeRef.current = 0;
          }, 3000);
        }
        return; // Exit after handling re-check-in
      } else if (checkInStatus === "pending") {
        // User is pending - proceed with verifyQR to activate check-in
        console.log("📝 User is pending - verifying QR to activate check-in");
        
        try {
          const checkInResult = await verifyQR(checkinIdFromResult, securityOfficer.id);

          if (checkInResult) {
            console.log("✓ QR verification successful - user is now checked in");
            
            // Try to fetch user data (may fail with 403 for security officers, which is expected)
            let userInfo = null;
            if (userId) {
              try {
                userInfo = await userService.getUserById(userId, { suppressErrorLog: true });
                console.log("✅ User data fetched successfully!");
              } catch (userError: any) {
                // Handle 403 gracefully - security officers don't have permission to view user details
                if (userError?.status === 403) {
                  console.log("ℹ️ Security officer does not have permission to view user details (expected)");
                } else {
                  console.error("❌ Failed to fetch user data:", userError);
                }
              }
            }
            
            // Extract user name from fetched data or use fallback
            const hasUserDetails = !!userInfo && (userInfo.first_name || userInfo.last_name || userInfo.email);
            let firstName = userInfo?.first_name || "";
            let lastName = userInfo?.last_name || "";
            
            // If we have user info but no name, try to extract from email
            if (!firstName && !lastName && hasUserDetails && userInfo?.email) {
              const emailName = userInfo.email.split('@')[0];
              firstName = emailName.split('.')[0] || emailName;
              lastName = emailName.split('.')[1] || "";
            }
            
            // Final fallback
            if (!firstName && !lastName) {
              if (hasUserDetails && userInfo?.email) {
                firstName = userInfo.email.split('@')[0];
              } else {
                firstName = "Verified";
                lastName = userId ? `User ID: ${userId.substring(0, 8)}` : "User";
              }
            }
            
            const userPhone = userInfo?.phone || (hasUserDetails ? "Not Available" : "Limited Access");
            const userEmail = userInfo?.email || (hasUserDetails ? "Not Available" : `User ID: ${userId?.substring(0, 8) || 'N/A'}...`);
            
            // Create check-in response object for modal
            const finalCheckInData: CheckInResponse = {
              id: checkinIdFromResult,
              check_in_time: new Date().toISOString(),
              status: 'checked_in' as const,
              user_id: userId,
              floor: floor,
              block: block,
              laptop_model: laptop,
              laptop_asset_number: assetNumber,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Convert to UserData format for display
            const userData: UserData = {
              name: firstName,
              surname: lastName,
              phone: userPhone,
              email: userEmail,
              floor: floor,
              block: block,
              laptop: laptop,
              assetNumber: assetNumber,
              photo: firstName !== "Unknown" && lastName !== "Unknown" 
                ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}` 
                : "UU",
              employeeId: userId || "",
              isCheckedIn: true, // User was pending, now checked in
            };

            console.log("✅ Final userData for display:", userData);
            setScannedUser(userData);
            setScannedCheckIn(finalCheckInData);
            // Scanner remains paused - will resume when user closes modal or clears scan
          } else {
            setErrorMessage("Failed to verify QR code. Please try again.");
            setTimeout(() => {
              if (scannerRef.current && isScanning) {
                try {
                  scannerRef.current.resume();
                } catch (resumeErr: any) {
                  if (!resumeErr.message?.includes('not paused') && 
                      !resumeErr.message?.includes('not running')) {
                    console.warn("Warning resuming scanner:", resumeErr);
                  }
                }
              }
              lastScannedIdRef.current = null;
              lastScanTimeRef.current = 0;
            }, 2000);
          }
        } catch (verifyQRError: any) {
          console.error("❌ verifyQR failed:", verifyQRError);
          setErrorMessage(verifyQRError.message || "Failed to verify QR code. Please try again.");
          setTimeout(() => {
            if (scannerRef.current && isScanning) {
              try {
                scannerRef.current.resume();
              } catch (resumeErr: any) {
                if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                  console.warn("Warning resuming scanner:", resumeErr);
                }
              }
            }
            lastScannedIdRef.current = null;
            lastScanTimeRef.current = 0;
          }, 2000);
          return;
        }
      } else {
        // Unexpected status
        console.error("❌ Unexpected check-in status:", checkInStatus);
        setErrorMessage(`Unexpected check-in status: ${checkInStatus}. Please try again.`);
        setTimeout(() => {
          if (scannerRef.current && isScanning) {
            try {
              scannerRef.current.resume();
            } catch (resumeErr: any) {
              if (!resumeErr.message?.includes('not paused') && !resumeErr.message?.includes('not running')) {
                console.warn("Warning resuming scanner:", resumeErr);
              }
            }
          }
          lastScannedIdRef.current = null;
          lastScanTimeRef.current = 0;
        }, 2000);
        return;
      }
    } catch (err: any) {
      console.error("Error verifying QR code:", err);
      
      // Handle 401 authentication errors specifically
      if (err?.status === 401) {
        setErrorMessage("Authentication failed. Please log in again.");
        // Redirect to login after showing error
        setTimeout(() => {
          logout();
          router.push("/security/login");
        }, 2000);
      } else {
        setErrorMessage(err.message || "Failed to verify QR code. Please try again.");
      }
      
      // Resume scanning after a delay (if not redirecting)
      if (err?.status !== 401) {
        setTimeout(() => {
          if (scannerRef.current && isScanning) {
            try {
              scannerRef.current.resume();
            } catch (resumeErr: any) {
              // Ignore resume errors - scanner might not be paused or might be in wrong state
              if (!resumeErr.message?.includes('not paused') && 
                  !resumeErr.message?.includes('not running')) {
                console.warn("Warning resuming scanner:", resumeErr);
              }
            }
          }
          lastScannedIdRef.current = null; // Clear so user can retry
          lastScanTimeRef.current = 0; // Reset timestamp
        }, 2000);
      }
    }
  };

  const onScanFailure = (errorMessage?: string) => {
    // Silent failure is expected when no QR code is visible
    // Only log if there's an actual error message
    if (errorMessage && !errorMessage.includes('NotFoundException')) {
      // NotFoundException is normal when no QR code is in frame
      console.log("Scan attempt (no QR code in frame):", errorMessage);
    }
  };


  const handleCheckIn = () => {
    // Note: The verifyQR API call already handles check-in verification
    // This button is mainly for display/confirmation
    // The actual check-in status comes from the API response
    if (!scannedUser) return;

    if (scannedUser.isCheckedIn) {
      setSuccessMessage(`⚠️ ${scannedUser.name} ${scannedUser.surname} is already checked in`);
    } else {
      setSuccessMessage(`✓ ${scannedUser.name} ${scannedUser.surname} CHECKED IN`);
      // Update local stats
      setStats(prev => ({
        ...prev,
        totalInBuilding: prev.totalInBuilding + 1,
        employees: prev.employees + 1,
      }));
    }

    setTimeout(() => setSuccessMessage(null), 3000);
    closeUserInfo();
  };

  const handleCheckOut = async () => {
    if (!scannedUser || !scannedCheckIn) {
      setErrorMessage("No check-in found to check out.");
      return;
    }

    const checkInId = scannedCheckIn.id || (scannedCheckIn as any).checkin_id;
    if (!checkInId) {
      setErrorMessage("Check-in ID not found.");
      return;
    }

    try {
      console.log("🔄 Attempting to check out:", checkInId);
      setErrorMessage(null);

      // Call the check-out API endpoint
      const result = await checkOutUser(checkInId);

      if (result) {
        console.log("✅ Check-out successful:", result);
        setSuccessMessage(`✓ ${scannedUser.name} ${scannedUser.surname} CHECKED OUT`);
        
        // Update local stats
        setStats(prev => ({
          ...prev,
          totalInBuilding: Math.max(0, prev.totalInBuilding - 1),
          employees: Math.max(0, prev.employees - 1),
        }));

        // Update scanned user status
        setScannedUser(prev => prev ? { ...prev, isCheckedIn: false } : null);
      } else {
        setErrorMessage("Failed to check out. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Check-out error:", err);
      setErrorMessage(err.message || "Failed to check out. Please try again.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setTimeout(() => {
      setSuccessMessage(null);
      closeUserInfo();
    }, 3000);
  };

  const closeUserInfo = () => {
    setScannedUser(null);
    setScannedCheckIn(null);
    lastScannedIdRef.current = null; // Clear last scanned ID so user can scan again
    lastScanTimeRef.current = 0; // Reset timestamp
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (err) {
        // Ignore resume errors
      }
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
    // Clear authentication and redirect to login
    logout();
    router.push("/security/login");
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading security checkpoint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-[60] font-bold text-center animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl z-[60] font-bold text-center animate-bounce">
          {errorMessage}
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
          {/* Camera Selector - Only show if multiple cameras available */}
          {availableCameras.length > 1 && (
            <Card className="bg-gray-700 p-3 mb-3">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-gray-300" />
                <label className="text-sm text-gray-300 font-medium">Camera:</label>
                <Select
                  value={selectedCameraId || ""}
                  onValueChange={handleCameraChange}
                >
                  <SelectTrigger className="flex-1 bg-gray-600 border-gray-500 text-white">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCameras.map((camera) => (
                      <SelectItem key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}
          
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
                  {scannedUser.name && scannedUser.surname && 
                   scannedUser.name !== "Verified User" && 
                   scannedUser.name !== "Unknown" &&
                   scannedUser.surname !== "Unknown" &&
                   !scannedUser.name.includes("ID:") &&
                   !scannedUser.surname.includes("ID:")
                    ? `${scannedUser.name} ${scannedUser.surname}`
                    : scannedUser.email && !scannedUser.email.includes("User ID:")
                    ? scannedUser.email
                    : scannedUser.name && scannedUser.name !== "Verified User" && scannedUser.name !== "Unknown"
                    ? scannedUser.name
                    : "Verified User"}
                </h2>
                {scannedUser.email && !scannedUser.email.includes("User ID:") && scannedUser.name && scannedUser.surname && (
                  <p className="text-gray-400 text-sm">{scannedUser.email}</p>
                )}
                {/* Show notice if data is limited */}
                {(scannedUser.floor === "Limited Access" || scannedUser.email.includes("User ID:") || scannedUser.phone === "Limited Access") && (
                  <p className="text-yellow-400 text-xs mt-2 italic">
                    ⚠️ Limited data access - Some details require admin permissions
                  </p>
                )}
              </div>

              {/* Details Grid */}
              <div className="space-y-3 mb-6">
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
                  disabled={!scannedUser.isCheckedIn || isCheckingOut}
                  className="h-14 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      Check Out
                    </>
                  )}
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
