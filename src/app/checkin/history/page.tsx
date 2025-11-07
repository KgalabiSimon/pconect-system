"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, TrendingUp, MapPin, Building2, Activity } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/toast";

export default function CheckInHistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getUserCheckInHistory, isLoading, error } = useCheckIns();
  const { error: showError, ToastContainer } = useToast();
  
  const [checkInHistory, setCheckInHistory] = useState<any[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch check-in history from API
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      try {
        const history = await getUserCheckInHistory(user.id);
        setHistoryError(null);
        
        // Transform API response to match UI format
        const transformedHistory = history.map((checkIn) => {
          const checkInTime = new Date(checkIn.check_in_time);
          const checkOutTime = checkIn.check_out_time ? new Date(checkIn.check_out_time) : null;
          
          // Calculate duration
          let duration = "N/A";
          if (checkOutTime) {
            const diffMs = checkOutTime.getTime() - checkInTime.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${hours}h ${minutes}m`;
          }
          
          return {
            id: checkIn.id,
            date: checkInTime.toISOString().split('T')[0],
            timeIn: checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timeOut: checkOutTime 
              ? checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : null,
            duration: duration,
            floor: checkIn.floor || "N/A",
            block: checkIn.block || "N/A",
            building: checkIn.building_id || "N/A",
            laptop: checkIn.laptop_model || "None",
            status: checkIn.status,
          };
        });
        
        // Sort by date (newest first)
        transformedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setCheckInHistory(transformedHistory);
      } catch (err: any) {
        const message = err?.message || 'Failed to fetch check-in history. Please try again.';
        setHistoryError(message);
        showError(message);
      }
    };

    if (isAuthenticated && user) {
      fetchHistory();
    }
  }, [user, isAuthenticated, getUserCheckInHistory]);

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    if (checkInHistory.length === 0) {
      return {
        totalCheckIns: 0,
        thisMonth: 0,
        lastMonth: 0,
        averageDuration: "0h 0m",
        mostUsedFloor: "N/A",
        mostUsedBlock: "N/A",
        mostUsedBuilding: "N/A",
        totalHoursWorked: 0,
        averageCheckInTime: "N/A",
        averageCheckOutTime: "N/A",
      };
    }

    const now = new Date();
    const thisMonth = checkInHistory.filter(c => {
      const checkInDate = new Date(c.date);
      return checkInDate.getMonth() === now.getMonth() && 
             checkInDate.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = checkInHistory.filter(c => {
      const checkInDate = new Date(c.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return checkInDate >= lastMonthDate && checkInDate < new Date(now.getFullYear(), now.getMonth(), 1);
    }).length;

    // Calculate durations
    const durations = checkInHistory
      .filter(c => c.duration !== "N/A")
      .map(c => {
        const [hours, minutes] = c.duration.split('h ').map((v: string) => parseInt(v.replace('m', '')));
        return hours + (minutes / 60);
      });

    const totalHours = durations.reduce((sum, h) => sum + h, 0);
    const avgHours = durations.length > 0 ? totalHours / durations.length : 0;
    const avgHoursInt = Math.floor(avgHours);
    const avgMins = Math.floor((avgHours - avgHoursInt) * 60);

    // Calculate most used locations
    const floorCounts: Record<string, number> = {};
    const blockCounts: Record<string, number> = {};
    checkInHistory.forEach(c => {
      floorCounts[c.floor] = (floorCounts[c.floor] || 0) + 1;
      blockCounts[c.block] = (blockCounts[c.block] || 0) + 1;
    });

    const mostUsedFloor = Object.entries(floorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const mostUsedBlock = Object.entries(blockCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Calculate average check-in/out times
    const checkInTimes = checkInHistory
      .map(c => {
        const [time, period] = c.timeIn.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return hour24 * 60 + parseInt(minutes);
      })
      .filter(t => !isNaN(t));

    const avgCheckInMinutes = checkInTimes.length > 0 
      ? checkInTimes.reduce((sum, t) => sum + t, 0) / checkInTimes.length 
      : 0;
    const avgCheckInHour = Math.floor(avgCheckInMinutes / 60);
    const avgCheckInMin = Math.floor(avgCheckInMinutes % 60);
    const avgCheckInTime = checkInTimes.length > 0
      ? `${avgCheckInHour.toString().padStart(2, '0')}:${avgCheckInMin.toString().padStart(2, '0')} ${avgCheckInHour >= 12 ? 'PM' : 'AM'}`
      : "N/A";

    return {
      totalCheckIns: checkInHistory.length,
      thisMonth,
      lastMonth,
      averageDuration: `${avgHoursInt}h ${avgMins}m`,
      mostUsedFloor,
      mostUsedBlock,
      mostUsedBuilding: "N/A", // Would need building names
      totalHoursWorked: Math.round(totalHours * 10) / 10,
      averageCheckInTime: avgCheckInTime,
      averageCheckOutTime: "N/A", // Can calculate similarly if needed
    };
  };

  const analytics = calculateAnalytics();

  // Calculate floor usage breakdown from real data
  const calculateFloorUsage = () => {
    const floorCounts: Record<string, number> = {};
    checkInHistory.forEach(c => {
      floorCounts[c.floor] = (floorCounts[c.floor] || 0) + 1;
    });

    const total = checkInHistory.length || 1;
    return Object.entries(floorCounts)
      .map(([floor, count]) => ({
        floor,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const floorUsage = calculateFloorUsage();

  // Building usage is not available in API response yet
  // Would need building names from buildings API
  const buildingUsage: Array<{ building: string; count: number; percentage: number }> = [];

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-in history...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your check-in history</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <ToastContainer />
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/checkin" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Check-In History & Analytics
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Total Check-Ins</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.totalCheckIns}
              </span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">This Month</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {analytics.thisMonth}
                </span>
                {analytics.thisMonth > analytics.lastMonth && (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4 col-span-2 md:col-span-1">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Avg Duration</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.averageDuration}
              </span>
            </div>
          </Card>
        </div>

        {/* Time Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Avg Check-In Time</div>
                <div className="font-semibold text-lg">{analytics.averageCheckInTime}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Avg Check-Out Time</div>
                <div className="font-semibold text-lg">{analytics.averageCheckOutTime}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Total Hours</div>
                <div className="font-semibold text-lg">{analytics.totalHoursWorked}h</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Floor Usage Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Floor Usage</h3>
          <div className="space-y-4">
            {floorUsage.map((item) => (
              <div key={item.floor}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.floor}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} times ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Building Usage */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Building Usage</h3>
          <div className="space-y-4">
            {buildingUsage.map((item) => (
              <div key={item.building}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.building}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} times ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Used Locations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Building</div>
                <div className="font-semibold">{analytics.mostUsedBuilding}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Floor</div>
                <div className="font-semibold">{analytics.mostUsedFloor}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Most Used Block</div>
                <div className="font-semibold">{analytics.mostUsedBlock}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Check-In History */}
        <h2 className="text-xl font-bold mb-4">Check-In History</h2>
        
        {(error || historyError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <p className="text-red-700 text-sm">{historyError || error}</p>
          </div>
        )}

        {checkInHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No check-in history found</p>
            <p className="text-sm text-gray-500">Your check-in history will appear here once you start checking in.</p>
          </Card>
        ) : (
        <div className="space-y-3">
          {checkInHistory.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{record.date}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.building} • {record.floor} • {record.block}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  record.status === 'checked_out' 
                    ? 'bg-green-100 text-green-700'
                    : record.status === 'checked_in'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {record.status === 'checked_out' ? 'Completed' : 
                   record.status === 'checked_in' ? 'Active' : 
                   'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Time In</div>
                  <div className="font-semibold text-primary">{record.timeIn}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Time Out</div>
                  <div className="font-semibold text-amber-700">{record.timeOut}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold text-green-700">{record.duration}</div>
                </div>
              </div>

              {record.laptop && record.laptop !== "None" && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Laptop:</strong> {record.laptop}
                </div>
              )}
            </Card>
          ))}
        </div>
        )}

        {/* Back Button */}
        <Link href="/checkin" className="block mt-6">
          <Button variant="outline" className="w-full">
            Back to Check-In
          </Button>
        </Link>
      </div>
    </div>
    </ProtectedRoute>
  );
}
