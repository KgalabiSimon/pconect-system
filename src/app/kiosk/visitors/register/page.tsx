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
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);

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
    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      const timeout = setTimeout(() => {
        if (!showSuccess && currentStep > 1) {
          if (confirm("Are you still there? The form will reset due to inactivity.")) {
            // User clicked OK, give them more time
            resetIdleTimer();
          } else {
            // Reset to step 1
            handleReset();
          }
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
      return;
    }

    const debounceTimer = setTimeout(() => {
      setIsSearching(true);
      // Simulate API call
      const results = sampleEmployees.filter((emp) =>
        emp.fullName.toLowerCase().includes(employeeSearchQuery.toLowerCase())
      );
      setEmployeeSearchResults(results);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [employeeSearchQuery]);

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
    try {
      console.log("📸 Requesting camera access...");

      // Stop any existing stream first
      if (streamRef.current) {
        console.log("Stopping existing stream...");
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
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
      console.log("✅ Camera access granted");
      console.log("Stream active:", stream.active);
      console.log("Video tracks:", stream.getVideoTracks().length);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video metadata and start playing
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = async () => {
              console.log("✅ Video metadata loaded");
              console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);

              try {
                await videoRef.current?.play();
                console.log("✅ Video is playing");
                console.log("Video readyState:", videoRef.current?.readyState);
                // Wait a bit for the first frame to be available
                setTimeout(() => resolve(), 500);
              } catch (playError) {
                console.error("❌ Play error:", playError);
                resolve();
              }
            };
          }
        });

        setShowCamera(true);
      }
    } catch (error) {
      console.error("❌ Camera error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert("Camera permission denied. Please allow camera access in your browser settings and try again.");
        } else if (error.name === "NotFoundError") {
          alert("No camera found on this device. Please use a device with a camera.");
        } else if (error.name === "NotReadableError") {
          alert("Camera is already in use by another application. Please close other apps and try again.");
        } else {
          alert(`Unable to access camera: ${error.message}. Please check your browser settings.`);
        }
      } else {
        alert("Unable to access camera. Please ensure camera permissions are granted.");
      }
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    console.log("📸 Attempting to capture photo...");

    if (!videoRef.current || !canvasRef.current) {
      console.error("❌ Video or canvas ref not available");
      alert("Unable to capture photo. Please try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    console.log("Video readyState:", video.readyState);
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
    console.log("Video paused:", video.paused);

    if (video.readyState < 2) {
      console.error("❌ Video not ready. ReadyState:", video.readyState);
      alert("Video is not ready. Please wait a moment and try again.");
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("❌ Video has no dimensions");
      alert("Camera feed not loaded properly. Please close and reopen the camera.");
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mirror the image (selfie mode)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      console.log("✅ Image drawn to canvas");

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log("✅ Blob created, size:", blob.size, "bytes");
          setFormData({ ...formData, photoUrl: url, photoBlob: blob });
          setErrors({ ...errors, photoUrl: "" });
          console.log("✅ Photo captured successfully");
          stopCamera();
        } else {
          console.error("❌ Failed to create blob");
          alert("Failed to capture photo. Please try again.");
        }
      }, "image/jpeg", 0.95);
    } else {
      console.error("❌ Could not get canvas context");
      alert("Unable to capture photo. Please try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      console.log("🛑 Stopping camera stream");
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const retakePhoto = () => {
    // Clean up old photo URL
    if (formData.photoUrl) {
      URL.revokeObjectURL(formData.photoUrl);
    }
    setFormData({ ...formData, photoUrl: "", photoBlob: null });
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

    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, you would:
      // 1. Upload photo: POST /api/uploads
      // 2. Submit registration: POST /api/visitors/registrations

      console.log("Visitor registration submitted:", {
        ...formData,
        timestamp: new Date().toISOString(),
        deviceId: localStorage.getItem("kioskDeviceId") || "KIOSK-001",
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit registration. Please try again.");
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
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="pl-12 h-16 text-lg"
                  disabled={formData.visitPurpose === "Other"}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                )}
              </div>

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

                {!formData.photoUrl && !showCamera && (
                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      className="w-full h-20 text-lg bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="w-6 h-6 mr-3" />
                      Take Photo
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
