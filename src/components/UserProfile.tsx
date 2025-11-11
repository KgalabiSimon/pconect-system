/**
 * User Profile Component
 * Displays user information and logout functionality
 */

'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, Mail, Phone, Building, Laptop } from "lucide-react";
import { useAuth } from "@/hooks/api/useAuth";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  showLogout?: boolean;
  compact?: boolean;
}

export function UserProfile({ showLogout = true, compact = false }: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-gray-600">
        Not logged in
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </span>
        </div>
        {showLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {user.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}
            
            {user.building_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="w-4 h-4" />
                <span>Building ID: {user.building_id}</span>
              </div>
            )}
            
            {user.laptop_model && (
              <div className="flex items-center gap-2 text-gray-600">
                <Laptop className="w-4 h-4" />
                <span>{user.laptop_model}</span>
                {user.laptop_asset_number && (
                  <span className="text-gray-500">({user.laptop_asset_number})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {showLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </Card>
  );
}

export default UserProfile;
