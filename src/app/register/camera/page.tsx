"use client";

import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

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

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const confirmAndContinue = () => {
    // Save selfie data (in a real app, this would upload to server)
    sessionStorage.setItem("selfieCaptured", "true");
    sessionStorage.setItem("isLoggedIn", "true");
    if (capturedImage) {
      sessionStorage.setItem("selfieImage", capturedImage);
    }

    // Navigate to home page
    router.push("/");
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
                  className="w-full h-14 text-base md:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  CONFIRM & CONTINUE
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
