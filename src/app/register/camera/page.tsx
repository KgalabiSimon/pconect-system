"use client";

import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authService, userService } from "@/lib/api";
import { useAuth } from "@/hooks/api/useAuth";

export default function CameraPage() {
  const router = useRouter();
  const { loginUser, refreshUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    // Request camera access
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // Use front camera for selfie
          audio: false,
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setCameraError("Unable to access camera. Please check permissions.");
      }
    };

    // If we already have registeredUserId from a previous render, just start camera
    // This prevents Fast Refresh from clearing the state
    if (registeredUserId) {
      console.log("📷 Camera page already initialized, userId:", registeredUserId);
    startCamera();
      return () => {
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
      };
    }

    // If already initialized but no userId, don't do anything (waiting for state update)
    if (isInitialized) {
      return;
    }

    // Check if user just registered (has pending photo user ID)
    const pendingPhotoUserId = sessionStorage.getItem("pendingPhotoUserId");
    console.log("📷 Camera page - pendingPhotoUserId:", pendingPhotoUserId);
    
    if (pendingPhotoUserId) {
      console.log("✅ User registered, starting camera for user:", pendingPhotoUserId);
      setRegisteredUserId(pendingPhotoUserId);
      setIsInitialized(true);
      // Don't remove from sessionStorage yet - only remove after photo is uploaded
      // This way if Fast Refresh happens, we can still recover it
      startCamera();
    } else {
      // If no pending registration, redirect to registration page
      console.log("⚠️ No pending registration found, redirecting to register page");
      router.push("/register");
      return;
    }

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [router, registeredUserId, isInitialized]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    // Restart camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((error) => {
        console.error("Error restarting camera:", error);
        setCameraError("Unable to restart camera.");
      });
  };

  const confirmAndContinue = async () => {
    if (!capturedImage) {
      setError("Please capture a photo first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("📸 Processing photo for user:", registeredUserId);
      
      // For now, store photo as data URL in localStorage
      // In production, this should upload to Azure Blob Storage or similar
      // and update the user's photo_url field via API
      
      // Store photo temporarily in localStorage for profile display
      localStorage.setItem("user_photo_data", capturedImage);
      console.log("✅ Photo stored in localStorage");

      // If we have a registered user ID, we could update the photo_url
      // However, since file upload endpoint may not exist, we'll skip for now
      // The photo will be available from localStorage until proper upload is implemented
      
      // Note: In a real implementation, you would:
      // 1. Upload photo to Azure Blob Storage or file service
      // 2. Get the URL back
      // 3. Update user profile with photo_url via userService.updateUser()

      // For now, since the user is already registered, we need to log them in
      // We'll need to get the email/password from somewhere - but we don't have it
      // So we'll just navigate to login page with a message
      
      // Clear any old session data and the pending photo user ID
      sessionStorage.removeItem("selfieCaptured");
      sessionStorage.removeItem("selfieImage");
      sessionStorage.removeItem("pendingPhotoUserId"); // Remove after photo is processed
      
      console.log("✅ Registration complete! Navigating to login page...");
      // Navigate to login page with success message
      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("❌ Error processing photo:", err);
      setError("Failed to process photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold text-foreground text-center">
          Take a Selfie
        </h1>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-900">
        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="w-full max-w-md">
          <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden shadow-xl">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
                    <p>{cameraError}</p>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
            )}

            {/* Guide overlay */}
            {!capturedImage && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-4 border-white/30 rounded-full" />
              </div>
            )}
          </div>

          {/* Instructions */}
          {!capturedImage && !cameraError && (
            <p className="text-white text-center mt-4 text-sm md:text-base">
              Position your face in the center and tap capture
            </p>
          )}

          {/* Canvas for capturing image (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="w-full h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                CAPTURE PHOTO
              </Button>
            ) : (
              <>
                <Button
                  onClick={confirmAndContinue}
                  className="w-full h-14 text-base md:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      CONFIRM & CONTINUE
                    </>
                  )}
                </Button>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-white text-white hover:bg-white/10 rounded-lg"
                >
                  RETAKE PHOTO
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
