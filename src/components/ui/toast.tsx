"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { Button } from "./button";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = toast.duration ?? 5000; // Default 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-amber-700",
    info: "text-blue-700",
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${bgColors[toast.type]} ${textColors[toast.type]} border rounded-lg px-4 py-3 shadow-lg mb-2 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2">
        {icons[toast.type]}
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(toast.id), 300);
          }}
          className={`${textColors[toast.type]} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => showToast(message, "success", duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, "error", duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, "warning", duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, "info", duration), [showToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />,
  };
}

