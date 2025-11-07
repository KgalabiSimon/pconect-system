"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, UserCheck, TrendingUp, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { useVisitors } from "@/hooks/api/useVisitors";
import { useToast } from "@/components/ui/toast";
import type { CheckInResponse, VisitorResponse } from "@/types/api";

type FloorStat = {
  floor: string;
  count: number;
  percentage: number;
};

type ActivityItem = {
  name: string;
  action: "Check-In" | "Check-Out";
  timeLabel: string;
  type: "Employee" | "Visitor";
};

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 0) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function formatAverageStay(minutes: number): string {
  if (!minutes || Number.isNaN(minutes)) return "--";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} hr${hours === 1 ? "" : "s"}`;
  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min`;
}

function computeFloorBreakdown(employees: CheckInResponse[], visitors: VisitorResponse[]): FloorStat[] {
  const counts = new Map<string, number>();
  const record = (label: string | undefined | null) => {
    const key = (label && label.trim()) || "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  employees.forEach((entry) => record(entry.floor));
  visitors.forEach((visitor) => record(visitor.floor));

  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
  if (!total) return [];

  return Array.from(counts.entries())
    .map(([floor, count]) => ({
      floor,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function BuildingStatsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalInBuilding: 0,
    employees: 0,
    visitors: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    peakTime: "--",
    averageStayTime: "--",
  });
  const [floorBreakdown, setFloorBreakdown] = useState<FloorStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const { filterCheckIns, isLoading: checkInsLoading } = useCheckIns();
  const { getActiveVisitors, getVisitorLogs } = useVisitors();
  const { error: showError, ToastContainer } = useToast();

  const isBusy = refreshing || checkInsLoading;

  const buildRecentActivity = useCallback((employeeEvents: CheckInResponse[], visitorEvents: VisitorResponse[]) => {
    const raw: Array<{ name: string; action: "Check-In" | "Check-Out"; timestamp: number; type: "Employee" | "Visitor" }> = [];

    employeeEvents.forEach((entry) => {
      const displayName = entry.user?.first_name || entry.user?.last_name ? `${entry.user?.first_name ?? ""} ${entry.user?.last_name ?? ""}`.trim() : "Employee";
      if (entry.check_in_time) {
        const ts = new Date(entry.check_in_time).getTime();
        if (!Number.isNaN(ts)) {
          raw.push({ name: displayName || "Employee", action: "Check-In", timestamp: ts, type: "Employee" });
        }
      }
      if (entry.check_out_time) {
        const ts = new Date(entry.check_out_time).getTime();
        if (!Number.isNaN(ts)) {
          raw.push({ name: displayName || "Employee", action: "Check-Out", timestamp: ts, type: "Employee" });
        }
      }
    });

    visitorEvents.forEach((visitor: any) => {
      const name = [visitor.first_name, visitor.last_name].filter(Boolean).join(" ") || "Visitor";
      if (visitor.check_in_time) {
        const ts = new Date(visitor.check_in_time).getTime();
        if (!Number.isNaN(ts)) {
          raw.push({ name, action: "Check-In", timestamp: ts, type: "Visitor" });
        }
      }
      if (visitor.check_out_time) {
        const ts = new Date(visitor.check_out_time).getTime();
        if (!Number.isNaN(ts)) {
          raw.push({ name, action: "Check-Out", timestamp: ts, type: "Visitor" });
        }
      }
    });

    return raw
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6)
      .map<ActivityItem>((item) => ({
        name: item.name,
        action: item.action,
        type: item.type,
        timeLabel: formatRelativeTime(item.timestamp),
      }));
  }, []);

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const startIso = startOfDay.toISOString();
      const endIso = endOfDay.toISOString();

      const [activeEmployees, activeVisitorsList, todaysCheckIns, visitorLogs] = await Promise.all([
        filterCheckIns({ status: "checked_in", user_type: "employee" }),
        getActiveVisitors(),
        filterCheckIns({ start_date: startIso, end_date: endIso }),
        getVisitorLogs().catch(() => [] as VisitorResponse[]),
      ]);

      const employeeCount = Array.isArray(activeEmployees) ? activeEmployees.length : 0;
      const visitorCount = Array.isArray(activeVisitorsList) ? activeVisitorsList.length : 0;
      const totalInBuilding = employeeCount + visitorCount;

      const todaysEmployeeEvents = Array.isArray(todaysCheckIns) ? todaysCheckIns : [];
      const checkInsTodayCount = todaysEmployeeEvents.filter((entry) => entry.status !== "checked_out").length;
      const checkOutsTodayCount = todaysEmployeeEvents.filter((entry) => entry.status === "checked_out").length;

      // Peak hour calculation based on check-in times
      const hourlyCounts = todaysEmployeeEvents.reduce<Record<string, number>>((acc, entry) => {
        if (!entry.check_in_time) return acc;
        const hourKey = new Date(entry.check_in_time).toLocaleTimeString("en-ZA", { hour: "2-digit", hour12: false });
        acc[hourKey] = (acc[hourKey] ?? 0) + 1;
        return acc;
      }, {});

      const peakTime = Object.keys(hourlyCounts).length
        ? Object.entries(hourlyCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1)
            .map(([hour]) => {
              const startHour = parseInt(hour, 10);
              const endHour = (startHour + 1) % 24;
              const formatHour = (h: number) => {
                const suffix = h >= 12 ? "PM" : "AM";
                const display = ((h + 11) % 12) + 1;
                return `${display.toString().padStart(2, "0")}:00 ${suffix}`;
              };
              return `${formatHour(startHour)} - ${formatHour(endHour)}`;
            })[0]
        : "--";

      const totalStayMinutes = todaysEmployeeEvents.reduce((total, entry) => {
        if (!entry.check_in_time || !entry.check_out_time) return total;
        const start = new Date(entry.check_in_time).getTime();
        const end = new Date(entry.check_out_time).getTime();
        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return total;
        return total + (end - start) / 60000;
      }, 0);

      const averageStayTime = todaysEmployeeEvents.length
        ? formatAverageStay(totalStayMinutes / todaysEmployeeEvents.length)
        : "--";

      setStats({
        totalInBuilding,
        employees: employeeCount,
        visitors: visitorCount,
        checkInsToday: checkInsTodayCount,
        checkOutsToday: checkOutsTodayCount,
        peakTime,
        averageStayTime,
      });

      setFloorBreakdown(computeFloorBreakdown(activeEmployees as CheckInResponse[], activeVisitorsList as VisitorResponse[]));
      setRecentActivity(buildRecentActivity(todaysEmployeeEvents, visitorLogs as unknown as VisitorResponse[]));
    } catch (error: any) {
      showError(error?.message || "Failed to load building statistics.");
    } finally {
      setRefreshing(false);
    }
  }, [buildRecentActivity, filterCheckIns, getActiveVisitors, getVisitorLogs, showError]);

  const handleRefresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const floorStats = useMemo(() => floorBreakdown, [floorBreakdown]);
  const activityFeed = useMemo(() => recentActivity, [recentActivity]);

  return (
    <ProtectedRoute>
      <ToastContainer />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link href="/security" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-lg font-bold">Building Statistics</h1>
                <p className="text-xs text-gray-400">Live data</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isBusy}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isBusy ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-xs font-medium">Total In Building</p>
              </div>
              <p className="text-4xl font-bold">{stats.totalInBuilding}</p>
            </Card>
            <Card className="bg-green-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5" />
                <p className="text-xs font-medium">Employees</p>
              </div>
              <p className="text-4xl font-bold">{stats.employees}</p>
            </Card>
            <Card className="bg-orange-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-xs font-medium">Visitors</p>
              </div>
              <p className="text-4xl font-bold">{stats.visitors}</p>
            </Card>
            <Card className="bg-purple-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <p className="text-xs font-medium">Check-Ins Today</p>
              </div>
              <p className="text-4xl font-bold">{stats.checkInsToday}</p>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gray-800 border-gray-700 p-4">
              <p className="text-gray-400 text-xs mb-1">Check-Outs Today</p>
              <p className="text-white font-bold">{stats.checkOutsToday}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <p className="text-gray-400 text-xs mb-1">Avg Stay Time</p>
              <p className="text-white font-bold">{stats.averageStayTime}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 p-4 col-span-2">
              <p className="text-gray-400 text-xs mb-1">Peak Hour</p>
              <p className="text-white font-bold">{stats.peakTime}</p>
            </Card>
          </div>

          {/* Floor Breakdown */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Floor Distribution
            </h3>
            {floorStats.length === 0 ? (
              <p className="text-gray-500 text-sm">No floor data available.</p>
            ) : (
              <div className="space-y-3">
                {floorStats.map((floor) => (
                  <div key={floor.floor}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{floor.floor}</span>
                      <span className="text-gray-400 text-xs">
                        {floor.count} ({floor.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${floor.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            {activityFeed.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity recorded.</p>
            ) : (
              <div className="space-y-2">
                {activityFeed.map((activity, index) => (
                  <div
                    key={`${activity.name}-${activity.action}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{activity.name}</p>
                      <p className="text-gray-400 text-xs">{activity.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${activity.action === "Check-In" ? "text-green-400" : "text-orange-400"}`}>
                        {activity.action}
                      </p>
                      <p className="text-gray-500 text-xs">{activity.timeLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Auto Refresh Notice */}
          <Card className="bg-gray-800 border-gray-700 p-3">
            <p className="text-gray-400 text-xs text-center">
              ✓ Auto-refreshing every 30 seconds
            </p>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
