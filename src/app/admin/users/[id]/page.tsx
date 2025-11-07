"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  TrendingUp,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState, useMemo } from "react";
import { useUsers } from "@/hooks/api/useUsers";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { CheckInResponse } from "@/types/api";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { loadUser, user, isLoading: userLoading, error: userError } = useUsers();
  const { filterCheckIns, isLoading: checkInsLoading } = useCheckIns();
  const { buildings } = useBuildings({ initialLoad: true });
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([]);

  // Load user data on mount
  useEffect(() => {
    if (id) {
      loadUser(id);
      // Load check-ins for this user
      filterCheckIns({ user_id: id }).then(setCheckIns);
    }
  }, [id, loadUser, filterCheckIns]);

  // Build building map for lookups
  const buildingMap = useMemo(() => {
    const map: Record<string, string> = {};
    buildings.forEach(building => {
      map[building.id] = building.name || building.building_code || building.id;
    });
    return map;
  }, [buildings]);

  // Calculate monthly statistics from check-ins
  const monthlyStats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get last 3 months
    const months = [
      { month: currentMonth, year: currentYear, name: today.toLocaleString('default', { month: 'long' }) },
      { month: currentMonth - 1, year: currentMonth === 0 ? currentYear - 1 : currentYear, name: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }) },
      { month: currentMonth - 2, year: currentMonth <= 1 ? currentYear - 1 : currentYear, name: new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' }) },
    ];

    const stats = months.map(({ month, year, name }) => {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const monthCheckIns = checkIns.filter(ci => {
        const checkInDate = new Date(ci.check_in_time);
        return checkInDate >= monthStart && checkInDate <= monthEnd;
      });

      // Calculate total hours from durations
      const totalHours = monthCheckIns.reduce((sum, ci) => {
        if (ci.duration_minutes) {
          return sum + (ci.duration_minutes / 60);
        } else if (ci.check_out_time) {
          // Calculate duration if duration_minutes is not available
          const checkInTime = new Date(ci.check_in_time);
          const checkOutTime = new Date(ci.check_out_time);
          const diffMs = checkOutTime.getTime() - checkInTime.getTime();
          return sum + (diffMs / (1000 * 60 * 60)); // Convert to hours
        }
        return sum;
      }, 0);

      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        checkIns: monthCheckIns.length,
        hours: Math.round(totalHours * 10) / 10,
      };
    });

    return {
      first: stats[0],
      second: stats[1],
      third: stats[2],
    };
  }, [checkIns]);

  const downloadReport = () => {
    if (!user) return;

    const userName = `${user.first_name} ${user.last_name}`;
    const buildingName = user.building_id ? (buildingMap[user.building_id] || user.building_id) : 'N/A';
    const programmeName = user.programme_id || 'N/A';

    const csv = [
      ["Check-In Report for " + userName],
      [""],
      ["User Information"],
      ["ID", user.id],
      ["Email", user.email],
      ["Phone", user.phone || 'N/A'],
      ["Building", buildingName],
      ["Programme", programmeName],
      [""],
      ["Check-In History"],
      ["Date", "Time In", "Time Out", "Duration (hours)", "Floor", "Block", "Building"],
      ...checkIns.map((c) => {
        const checkInDate = new Date(c.check_in_time);
        const dateStr = checkInDate.toISOString().split('T')[0];
        const timeIn = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const timeOut = c.check_out_time 
          ? new Date(c.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'N/A';
        const duration = c.duration_minutes 
          ? (c.duration_minutes / 60).toFixed(2)
          : c.check_out_time
          ? ((new Date(c.check_out_time).getTime() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(2)
          : 'N/A';
        const buildingName = c.building_id ? (buildingMap[c.building_id] || c.building_id) : 'N/A';
        
        return [
          dateStr,
          timeIn,
          timeOut,
          duration,
          c.floor || 'N/A',
          c.block || 'N/A',
          buildingName,
        ];
      }),
      [""],
      ["Monthly Summary"],
      ["Month", "Check-Ins", "Total Hours"],
      [`${monthlyStats.first.name} ${new Date().getFullYear()}`, monthlyStats.first.checkIns, monthlyStats.first.hours],
      [`${monthlyStats.second.name} ${new Date().getFullYear()}`, monthlyStats.second.checkIns, monthlyStats.second.hours],
      [`${monthlyStats.third.name} ${new Date().getFullYear()}`, monthlyStats.third.checkIns, monthlyStats.third.hours],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.first_name}-${user.last_name}-checkin-report.csv`;
    a.click();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{userError || 'User not found'}</p>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const buildingName = user.building_id ? (buildingMap[user.building_id] || user.building_id) : 'N/A';
  const programmeName = user.programme_id || 'N/A';
  const createdAt = user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A';

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
            </div>
          </div>
          <Button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Download Report</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* User Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">{user.phone || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Building</div>
                <div className="font-medium">{buildingName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Programme</div>
                <div className="font-medium">{programmeName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Laptop</div>
                <div className="font-medium">{user.laptop_model || 'N/A'}</div>
                {user.laptop_asset_number && (
                  <div className="text-xs text-gray-500 mt-1">Asset: {user.laptop_asset_number}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-medium">{createdAt}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90 mb-1">{monthlyStats.first.name} {new Date().getFullYear()}</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.first.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.first.hours} hours</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90 mb-1">{monthlyStats.second.name} {new Date().getFullYear()}</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.second.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.second.hours} hours</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90 mb-1">{monthlyStats.third.name} {new Date().getFullYear()}</div>
            <div className="text-3xl font-bold mb-1">{monthlyStats.third.checkIns}</div>
            <div className="text-sm opacity-90">Check-Ins</div>
            <div className="text-xs mt-2">{monthlyStats.third.hours} hours</div>
          </Card>
        </div>

        {/* Check-In History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Check-In History</h2>
          {checkInsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading check-ins...</p>
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No check-in history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkIns.map((checkIn) => {
                const checkInDate = new Date(checkIn.check_in_time);
                const dateStr = checkInDate.toISOString().split('T')[0];
                const timeIn = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const timeOut = checkIn.check_out_time 
                  ? new Date(checkIn.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : 'N/A';
                const duration = checkIn.duration_minutes 
                  ? `${Math.floor(checkIn.duration_minutes / 60)}h ${checkIn.duration_minutes % 60}m`
                  : checkIn.check_out_time
                  ? (() => {
                      const diffMs = new Date(checkIn.check_out_time).getTime() - checkInDate.getTime();
                      const hours = Math.floor(diffMs / (1000 * 60 * 60));
                      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      return `${hours}h ${minutes}m`;
                    })()
                  : 'N/A';
                const buildingName = checkIn.building_id ? (buildingMap[checkIn.building_id] || checkIn.building_id) : 'N/A';

                return (
                  <Card key={checkIn.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{dateStr}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            Ref: {checkIn.id.substring(0, 8)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs">Time In</div>
                            <div className="font-medium text-green-700">{timeIn}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Time Out</div>
                            <div className="font-medium text-orange-700">{timeOut}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Duration</div>
                            <div className="font-medium text-blue-700">{duration}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Location</div>
                            <div className="font-medium">{checkIn.floor || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>{checkIn.block || 'N/A'}</span>
                        </div>
                        {buildingName !== 'N/A' && (
                          <div className="text-xs text-gray-500">{buildingName}</div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
