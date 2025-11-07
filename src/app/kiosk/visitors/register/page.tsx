"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  MapPin,
  FileText,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  AlertTriangle,
  Shield,
  Building2,
  Phone,
  Briefcase,
  Edit2,
  X
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useVisitors } from "@/hooks/api/useVisitors";
import { useUsers } from "@/hooks/api/useUsers";
import { AlertCircle } from "lucide-react";

interface Employee {
  id: string;
  fullName: string;
  department: string;
  phoneExt?: string;
}

interface VisitorFormData {
  // Step 1
  visitPurpose: "EmployeeVisit" | "Other" | "";
  employeeId: string;
  employeeName: string;
  otherReason: string;
  // Step 2
  floor: string;
  block: string;
  // Step 3
  firstName: string;
  surname: string;
  company: string;
  mobile: string;
  // Step 4
  hasWeapons: "no" | "yes";
  weaponDetails: string;
  photoUrl: string;
  photoBlob: Blob | null;
}

export default function VisitorKioskPage() {
  const { registerVisitor, isLoading: visitorLoading, error: visitorError, clearError: clearVisitorError } = useVisitors();
  const { searchUsers, isLoading: usersLoading } = useUsers();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VisitorFormData>({
    visitPurpose: "",
    employeeId: "",
    employeeName: "",
    otherReason: "",
    floor: "",
    block: "",
    firstName: "",
    surname: "",
    company: "",
    mobile: "",
    hasWeapons: "no",
    weaponDetails: "",
    photoUrl: "",
    photoBlob: null,
  });

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [employeeSearchResults, setEmployeeSearchResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null); // Employee search error
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null); // Camera error
  const [isStartingCamera, setIsStartingCamera] = useState(false); // Camera loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(10);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sample employees for demo
  const sampleEmployees: Employee[] = [
    { id: "EMP-001", fullName: "John Doe", department: "Programme 1A", phoneExt: "1234" },
    { id: "EMP-002", fullName: "Sarah Williams", department: "Programme 2", phoneExt: "1235" },
    { id: "EMP-003", fullName: "Mike Johnson", department: "Programme 1B", phoneExt: "1236" },
    { id: "EMP-004", fullName: "Emma Davis", department: "IT Department", phoneExt: "1237" },
    { id: "EMP-005", fullName: "David Martinez", department: "HR Department", phoneExt: "1238" },
  ];

  // Update date/time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-ZA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Idle timeout handler (2 minutes)
  useEffect(() => {
    if (showSuccess || currentStep === 1) {
      setShowIdleWarning(false);
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      setShowIdleWarning(false); // Clear warning when timer resets
      setIdleCountdown(10);
      
      const timeout = setTimeout(() => {
        if (!showSuccess && currentStep > 1) {
          // Show warning modal with countdown
          setShowIdleWarning(true);
          setIdleCountdown(10);
          
          // Countdown timer
          const countdownInterval = setInterval(() => {
            setIdleCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                setShowIdleWarning(false);
                handleReset();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          // Clean up interval when component unmounts or warning is dismissed
          return () => clearInterval(countdownInterval);
        }
      }, 2 * 60 * 1000); // 2 minutes
      setIdleTimeout(timeout);
    };

    resetIdleTimer();

    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [currentStep, showSuccess]);

  // Employee search with debounce
  useEffect(() => {
    if (employeeSearchQuery.length < 2) {
      setEmployeeSearchResults([]);
      setIsSearching(false);
      setSearchError(null); // Clear error when query is too short
      return;
    }

    setIsSearching(true);
    setSearchError(null); // Clear previous errors
    let isCancelled = false;
    
    const debounceTimer = setTimeout(async () => {
      try {
        // Use searchUsers API instead of loadUsers to avoid infinite loop
        // searchUsers is optimized for this use case
        const searchResults = await searchUsers(employeeSearchQuery, 50);
        
        // Check if this effect was cancelled (query changed)
        if (isCancelled) return;
        
        // Map to employee format
        const results = searchResults.map((user: any) => ({
          id: user.id,
          fullName: `${user.first_name} ${user.last_name}`,
          department: user.programme_id || "Unknown",
          phoneExt: user.phone,
        }));
        
        setEmployeeSearchResults(results);
        setSearchError(null); // Clear error on success
      } catch (error: any) {
        // Only set error if not cancelled
        if (!isCancelled) {
          const errorMessage = error?.message || 'Unable to search employees. Please try again.';
          setSearchError(errorMessage);
          setEmployeeSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeSearchQuery]); // Only depend on search query to prevent infinite loop

  // Auto-reset after success (30 seconds)
  useEffect(() => {
    if (showSuccess) {
      successTimeoutRef.current = setTimeout(() => {
        handleReset();
      }, 30000); // 30 seconds

      return () => {
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
      };
    }
  }, [showSuccess]);

  const handleReset = () => {
    setCurrentStep(1);
    setFormData({
      visitPurpose: "",
      employeeId: "",
      employeeName: "",
      otherReason: "",
      floor: "",
      block: "",
      firstName: "",
      surname: "",
      company: "",
      mobile: "",
      hasWeapons: "no",
      weaponDetails: "",
      photoUrl: "",
      photoBlob: null,
    });
    setEmployeeSearchQuery("");
    setEmployeeSearchResults([]);
    setShowSuccess(false);
    setErrors({});
    setSearchError(null);
    setCameraError(null);
    setShowIdleWarning(false);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  };

  const selectEmployee = (employee: Employee) => {
    setFormData({
      ...formData,
      visitPurpose: "EmployeeVisit",
      employeeId: employee.id,
      employeeName: employee.fullName,
      otherReason: "",
    });
    setEmployeeSearchQuery(employee.fullName);
    setEmployeeSearchResults([]);
    setErrors({ ...errors, visitPurpose: "" });
  };

  const selectOther = () => {
    setFormData({
      ...formData,
      visitPurpose: "Other",
      employeeId: "",
      employeeName: "",
    });
    setEmployeeSearchQuery("");
    setErrors({ ...errors, visitPurpose: "" });
  };

  // Camera functions
  const startCamera = async () => {
    setCameraError(null); // Clear previous errors
    setIsStartingCamera(true); // Show loading state
    
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser. Please use a modern browser.");
      }

      // Request camera with specific constraints for front camera
      const constraints = {
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Show camera UI first so the video element is rendered
      setShowCamera(true);
      setCameraError(null);

      // Wait for React to render the video element
      // Use requestAnimationFrame to ensure DOM is updated
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(() => resolve(), 100);
        });
      });

      // Now the video element should be available
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setShowCamera(false);
        throw new Error("Video element not available after rendering");
      }

      // Set the stream to the video element
      videoRef.current.srcObject = stream;

      // Wait for video metadata and start playing
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element not available"));
          return;
        }

        const video = videoRef.current;
        let resolved = false;

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
        };

        const onLoadedMetadata = async () => {
          if (resolved) return;
          try {
            await video.play();
            // Wait a bit for the first frame to be available
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                cleanup();
                resolve();
              }
            }, 500);
          } catch (playError) {
            if (!resolved) {
              resolved = true;
              cleanup();
              setCameraError("Camera is ready but video playback failed. Please try again.");
              reject(playError);
            }
          }
        };

        const onError = () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            setCameraError("Failed to load camera feed. Please try again.");
            reject(new Error("Video load error"));
          }
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            setCameraError("Camera took too long to load. Please try again.");
            reject(new Error("Camera timeout"));
          }
        }, 10000);
      });

      // Success - camera is ready
      setIsStartingCamera(false);
    } catch (error) {
      setIsStartingCamera(false);
      let errorMessage = "Unable to access camera. Please ensure camera permissions are granted.";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Camera permission denied. Please allow camera access in your browser settings and try again.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "No camera found on this device. Please use a device with a camera.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Camera is already in use by another application. Please close other apps and try again.";
        } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
          errorMessage = "Camera doesn't support the required settings. Please try again.";
        } else if (error.message) {
          errorMessage = `Unable to access camera: ${error.message}. Please check your browser settings.`;
        }
      }
      
      setCameraError(errorMessage);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    // Clear previous photo errors
    const newErrors = { ...errors, photoUrl: "" };
    setErrors(newErrors);
    setCameraError(null);

    if (!videoRef.current) {
      const errorMsg = "Video element not found. Please try again.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
      return;
    }

    if (!canvasRef.current) {
      const errorMsg = "Canvas element not found. Please try again.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready (HAVE_CURRENT_DATA = 2, HAVE_ENOUGH_DATA = 4)
    if (video.readyState < 2) {
      const errorMsg = "Video is not ready. Please wait a moment and try again.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      const errorMsg = "Camera feed not loaded properly. Please close and reopen the camera.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const errorMsg = "Unable to get canvas context. Please try again.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
      return;
    }

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the video frame to canvas
      // CSS transform on video doesn't affect canvas drawing - we draw the raw video stream
      // For front camera, we mirror it to match what user sees (mirror effect)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Convert canvas to base64 data URL (API-compatible format)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      
      // Validate the data URL
      if (!dataUrl || dataUrl.length < 100 || !dataUrl.startsWith("data:image/jpeg")) {
        const errorMsg = "Failed to generate photo data. Please try again.";
        setErrors({ ...newErrors, photoUrl: errorMsg });
        return;
      }

      // Store the photo immediately (don't wait for blob)
      setFormData({ 
        ...formData, 
        photoUrl: dataUrl, // Base64 data URL - works for both display and API
        photoBlob: null // Will be created if needed
      });
      
      // Clear any errors
      setErrors({ ...newErrors, photoUrl: "" });
      
      // Stop the camera
      stopCamera();

      // Create blob asynchronously (non-blocking)
      canvas.toBlob((blob) => {
        if (blob) {
          setFormData((prevData) => ({ 
            ...prevData, 
            photoBlob: blob 
          }));
        }
      }, "image/jpeg", 0.95);
      
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? `Failed to capture photo: ${error.message}` 
        : "Failed to capture photo. Please try again.";
      setErrors({ ...newErrors, photoUrl: errorMsg });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null); // Clear camera error when stopping
  };

  const retakePhoto = () => {
    // Clean up old photo (data URLs don't need revoking, but clear the blob if it exists)
    // Note: Data URLs are just strings, no cleanup needed
    setFormData({ ...formData, photoUrl: "", photoBlob: null });
    setErrors({ ...errors, photoUrl: "" }); // Clear any photo errors
    startCamera();
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.visitPurpose) {
        newErrors.visitPurpose = "Please select who you're visiting or choose 'Other'";
      }
      if (formData.visitPurpose === "Other" && !formData.otherReason.trim()) {
        newErrors.otherReason = "Please enter your reason for visiting";
      }
    }

    if (step === 3) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.surname.trim()) {
        newErrors.surname = "Surname is required";
      }
      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      } else {
        const cleanMobile = formData.mobile.replace(/\s/g, "");
        if (!/^\d{10}$/.test(cleanMobile)) {
          newErrors.mobile = "Please enter a valid 10-digit mobile number (e.g., 0821234567)";
        }
      }
    }

    if (step === 4) {
      if (formData.hasWeapons === "yes" && !formData.weaponDetails.trim()) {
        newErrors.weaponDetails = "Please describe the weapon(s)";
      }
      if (!formData.photoUrl) {
        newErrors.photoUrl = "Please take a photo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    clearVisitorError();
    setErrors({ ...errors, submission: "" }); // Clear submission errors

    try {
      // Prepare visitor data for Azure API
      // Note: API expects 'purpose' not 'visit_purpose', and 'other_reason' for other visits
      const visitorData = {
        first_name: formData.firstName,
        last_name: formData.surname,
        company: formData.company || undefined, // Optional field
        mobile: formData.mobile,
        purpose: formData.visitPurpose === "EmployeeVisit" 
          ? `Visiting ${formData.employeeName}` 
          : formData.otherReason, // Required: 'purpose' field
        host_employee_id: formData.employeeId || undefined, // Optional
        host_employee_name: formData.employeeName || undefined, // Optional
        floor: formData.floor || undefined, // Optional
        block: formData.block || undefined, // Optional
        other_reason: formData.visitPurpose === "Other" ? formData.otherReason : undefined, // Optional
        has_weapons: formData.hasWeapons === "yes",
        weapon_details: formData.hasWeapons === "yes" ? formData.weaponDetails : undefined,
        photo_url: formData.photoUrl || undefined, // Optional - In production, upload photo first and get URL
      };

      // Register visitor with Azure API
      const newVisitor = await registerVisitor(visitorData);

      if (newVisitor) {
        setShowSuccess(true);
      } else {
        // If registerVisitor returns null, it means there was an error
        // The error should be in visitorError from the hook
        // But we'll also set a fallback error
        setErrors({ ...errors, submission: "Failed to submit registration. Please check the error message above and try again." });
      }
    } catch (error: any) {
      // Handle specific error types
      let errorMessage = "Failed to submit registration. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        // Handle API validation errors
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => err.msg).join(", ");
        } else {
          errorMessage = detail;
        }
      }
      
      setErrors({ ...errors, submission: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  const steps = [
    { number: 1, label: "Host", icon: User },
    { number: 2, label: "Location", icon: MapPin },
    { number: 3, label: "Details", icon: FileText },
    { number: 4, label: "Photo & Safety", icon: Camera },
    { number: 5, label: "Review", icon: CheckCircle },
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl p-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for visiting DSTI!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Please give the Security at check-in your mobile number{" "}
            <span className="font-bold text-2xl text-blue-600">{formData.mobile}</span> to complete your check-in.
          </p>
          <Button
            onClick={handleReset}
            className="w-full h-20 text-2xl font-bold bg-red-600 hover:bg-red-700"
          >
            Check In (Next Visitor)
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            This screen will automatically reset in 30 seconds
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Idle Warning Modal */}
      {showIdleWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Are you still there?
              </h2>
              <p className="text-gray-600 mb-4">
                The form will reset in <span className="font-bold text-red-600">{idleCountdown}</span> seconds due to inactivity.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowIdleWarning(false);
                    setIdleCountdown(10);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Reset Form
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {visitorError && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{visitorError}</span>
              <button
                onClick={clearVisitorError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-16">
                <Image
                  src="https://ext.same-assets.com/2434544859/849502017.png"
                  alt="P-Connect"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="relative w-20 h-20">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_O60OjGZ-JvEMg_5BRHor1H_aSpq_oNxXA&s"
                  alt="DSTI"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DSTI Visitor Registration</h1>
                <p className="text-sm text-gray-600">{currentDateTime}</p>
                <p className="text-xs text-gray-500">Powered by P-Connect</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Form Steps */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {/* Step 1: Who are you visiting? */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Who are you visiting?</h2>
                <p className="text-gray-600">Search the person you're visiting, or choose 'Other'.</p>
              </div>

              {/* Employee Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search employee name..."
                  value={employeeSearchQuery}
                  onChange={(e) => {
                    setEmployeeSearchQuery(e.target.value);
                    setSearchError(null); // Clear error when user types
                  }}
                  className="pl-12 h-16 text-lg"
                  disabled={formData.visitPurpose === "Other"}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                )}
              </div>
              
              {/* Search Error Message */}
              {searchError && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{searchError}</span>
                    <button
                      onClick={() => setSearchError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {employeeSearchResults.length > 0 && formData.visitPurpose !== "Other" && (
                <div className="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
                  {employeeSearchResults.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => selectEmployee(employee)}
                      className="w-full p-4 text-left hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-semibold text-lg">{employee.fullName}</div>
                      <div className="text-gray-600">{employee.department}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Employee */}
              {formData.visitPurpose === "EmployeeVisit" && formData.employeeName && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg text-green-900">
                        Visiting: {formData.employeeName}
                      </div>
                      <div className="text-green-700">Employee selected</div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFormData({ ...formData, visitPurpose: "", employeeId: "", employeeName: "" });
                        setEmployeeSearchQuery("");
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Other Option */}
              <button
                onClick={selectOther}
                className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                  formData.visitPurpose === "Other"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-lg">Other / No specific person</div>
                    <div className="text-gray-600">General visit or meeting</div>
                  </div>
                </div>
              </button>

              {/* Other Reason */}
              {formData.visitPurpose === "Other" && (
                <div>
                  <Label className="text-lg mb-2 block">Reason for visit *</Label>
                  <Input
                    value={formData.otherReason}
                    onChange={(e) => setFormData({ ...formData, otherReason: e.target.value })}
                    placeholder="e.g., Delivery, Meeting, Interview..."
                    className="h-16 text-lg"
                  />
                  {errors.otherReason && (
                    <p className="text-red-600 text-sm mt-1">{errors.otherReason}</p>
                  )}
                </div>
              )}

              {errors.visitPurpose && (
                <p className="text-red-600 text-sm">{errors.visitPurpose}</p>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} className="h-14 px-8 text-lg">
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Location (Optional) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Location (Optional)</h2>
                <p className="text-gray-600">Specify floor and block if you know where you're going.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg mb-2 block">Floor (Optional)</Label>
                  <Select value={formData.floor} onValueChange={(value) => setFormData({ ...formData, floor: value })}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                      <SelectItem value="First Floor">First Floor</SelectItem>
                      <SelectItem value="Second Floor">Second Floor</SelectItem>
                      <SelectItem value="Third Floor">Third Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg mb-2 block">Block (Optional)</Label>
                  <Select value={formData.block} onValueChange={(value) => setFormData({ ...formData, block: value })}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Block A">Block A</SelectItem>
                      <SelectItem value="Block B">Block B</SelectItem>
                      <SelectItem value="Block C">Block C</SelectItem>
                      <SelectItem value="Block D">Block D</SelectItem>
                      <SelectItem value="Block E">Block E</SelectItem>
                      <SelectItem value="Block F">Block F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 text-sm">
                  💡 If you're not sure, you can leave these fields empty and Security will assist you.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline" className="h-14 px-8 text-lg">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-14 px-8 text-lg">
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
                <p className="text-gray-600">Please provide your contact information.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg mb-2 block">First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="h-14 text-lg"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg mb-2 block">Surname *</Label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="Doe"
                    className="h-14 text-lg"
                  />
                  {errors.surname && (
                    <p className="text-red-600 text-sm mt-1">{errors.surname}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-lg mb-2 block">Company (Optional)</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., ABC Corporation"
                  className="h-14 text-lg"
                />
              </div>

              <div>
                <Label className="text-lg mb-2 block">Mobile Number *</Label>
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, mobile: value });
                  }}
                  placeholder="0821234567"
                  className="h-14 text-lg"
                  maxLength={10}
                />
                <p className="text-gray-500 text-sm mt-1">Example: 0821234567 (10 digits)</p>
                {errors.mobile && (
                  <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">
                  🔒 <strong>Privacy Notice:</strong> By proceeding, you consent to DSTI processing your
                  information for access control and safety purposes.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline" className="h-14 px-8 text-lg">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-14 px-8 text-lg">
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Safety & Photo */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & Photo</h2>
                <p className="text-gray-600">Security declaration and visitor photo.</p>
              </div>

              {/* Weapons Declaration */}
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-amber-700" />
                  <Label className="text-xl font-semibold text-amber-900">
                    Are you carrying any weapons?
                  </Label>
                </div>
                <RadioGroup
                  value={formData.hasWeapons}
                  onValueChange={(value: "no" | "yes") =>
                    setFormData({ ...formData, hasWeapons: value })
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" className="w-6 h-6" />
                    <Label htmlFor="no" className="text-lg cursor-pointer">
                      No
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" className="w-6 h-6" />
                    <Label htmlFor="yes" className="text-lg cursor-pointer">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Weapon Details (if Yes) */}
              {formData.hasWeapons === "yes" && (
                <div>
                  <Label className="text-lg mb-2 block flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Describe the weapon(s) *
                  </Label>
                  <Textarea
                    value={formData.weaponDetails}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, weaponDetails: e.target.value })}
                    placeholder="Please provide detailed description of the weapon(s)..."
                    className="min-h-24 text-lg"
                    rows={3}
                  />
                  {errors.weaponDetails && (
                    <p className="text-red-600 text-sm mt-1">{errors.weaponDetails}</p>
                  )}
                </div>
              )}

              {/* Photo Capture */}
              <div>
                <Label className="text-lg mb-3 block flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Visitor Photo *
                </Label>

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm flex-1">{cameraError}</span>
                      <button
                        onClick={() => setCameraError(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {!formData.photoUrl && !showCamera && (
                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      disabled={isStartingCamera}
                      className="w-full h-20 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStartingCamera ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 mr-3" />
                          Take Photo
                        </>
                      )}
                    </Button>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-blue-900 text-sm">
                        📸 Click the button above to open your camera. You may need to allow camera access when prompted.
                      </p>
                    </div>
                  </div>
                )}

                {showCamera && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-96 object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Camera Ready
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        Position your face in the frame
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={capturePhoto}
                        className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700 font-semibold"
                      >
                        <Camera className="w-6 h-6 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1 h-16 text-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {formData.photoUrl && !showCamera && (
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={formData.photoUrl}
                        alt="Visitor photo"
                        className="w-full h-96 object-cover"
                      />
                    </div>
                    <Button
                      onClick={retakePhoto}
                      variant="outline"
                      className="w-full h-14 text-lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                )}

                {errors.photoUrl && (
                  <p className="text-red-600 text-sm mt-1">{errors.photoUrl}</p>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline" className="h-14 px-8 text-lg">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-14 px-8 text-lg">
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
                <p className="text-gray-600">Please verify all details before submitting.</p>
              </div>

              {/* Visit Information */}
              <Card className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Visit Information
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => jumpToStep(1)}
                    className="text-blue-600"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-medium">Purpose:</span>{" "}
                    {formData.visitPurpose === "EmployeeVisit"
                      ? `Visiting ${formData.employeeName}`
                      : formData.otherReason}
                  </div>
                </div>
              </Card>

              {/* Location */}
              {(formData.floor || formData.block) && (
                <Card className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => jumpToStep(2)}
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    {formData.floor && (
                      <div>
                        <span className="font-medium">Floor:</span> {formData.floor}
                      </div>
                    )}
                    {formData.block && (
                      <div>
                        <span className="font-medium">Block:</span> {formData.block}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Personal Details */}
              <Card className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Personal Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => jumpToStep(3)}
                    className="text-blue-600"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-medium">Name:</span> {formData.firstName}{" "}
                    {formData.surname}
                  </div>
                  {formData.company && (
                    <div>
                      <span className="font-medium">Company:</span> {formData.company}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Mobile:</span> {formData.mobile}
                  </div>
                </div>
              </Card>

              {/* Safety & Photo */}
              <Card className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Safety & Photo
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => jumpToStep(4)}
                    className="text-blue-600"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Weapons:</span>{" "}
                    {formData.hasWeapons === "yes" ? (
                      <span className="text-red-600 font-semibold">
                        Yes - {formData.weaponDetails}
                      </span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </div>
                  {formData.photoUrl && (
                    <div>
                      <div className="font-medium mb-2">Photo:</div>
                      <img
                        src={formData.photoUrl}
                        alt="Visitor"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Submission Error */}
              {errors.submission && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm flex-1">{errors.submission}</span>
                    <button
                      onClick={() => setErrors({ ...errors, submission: "" })}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline" className="h-14 px-8 text-lg">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
