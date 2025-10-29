/**
 * Logout Button Component
 * Provides logout functionality with confirmation
 */

'use client';

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/api/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = "outline", 
  size = "default", 
  showIcon = true,
  className = "",
  children
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoggingOut ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Logging out...</span>
        </div>
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2" />}
          {children || "Logout"}
        </>
      )}
    </Button>
  );
}

export default LogoutButton;
