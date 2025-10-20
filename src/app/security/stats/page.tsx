"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, UserCheck, TrendingUp, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function BuildingStatsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalInBuilding: 156,
    employees: 134,
    visitors: 22,
    checkInsToday: 189,
    checkOutsToday: 33,
    peakTime: "09:00 - 10:00 AM",
    averageStayTime: "7.5 hours",
  });

  const [floorBreakdown] = useState([
    { floor: "Ground Floor", count: 45, percentage: 29 },
    { floor: "First Floor", count: 52, percentage: 33 },
    { floor: "Second Floor", count: 38, percentage: 24 },
    { floor: "Third Floor", count: 21, percentage: 14 },
  ]);

  const [recentActivity] = useState([
    { name: "John Doe", action: "Check-In", time: "2 mins ago", type: "Employee" },
    { name: "Sarah Williams", action: "Check-Out", time: "5 mins ago", type: "Employee" },
    { name: "Mike Johnson", action: "Check-In", time: "8 mins ago", type: "Visitor" },
    { name: "Emily Davis", action: "Check-In", time: "12 mins ago", type: "Employee" },
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update stats in real-time
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
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
              <p className="text-xs text-gray-400">Real-Time Data</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
            <p className="text-gray-400 text-xs mb-1">Peak Time</p>
            <p className="text-white font-bold">{stats.peakTime}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400 text-xs mb-1">Avg Stay Time</p>
            <p className="text-white font-bold">{stats.averageStayTime}</p>
          </Card>
        </div>

        {/* Floor Breakdown */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Floor Distribution
          </h3>
          <div className="space-y-3">
            {floorBreakdown.map((floor) => (
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
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-white text-sm font-medium">{activity.name}</p>
                  <p className="text-gray-400 text-xs">{activity.type}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    activity.action === "Check-In" ? "text-green-400" : "text-orange-400"
                  }`}>
                    {activity.action}
                  </p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Auto Refresh Notice */}
        <Card className="bg-gray-800 border-gray-700 p-3">
          <p className="text-gray-400 text-xs text-center">
            ✓ Auto-refreshing every 30 seconds
          </p>
        </Card>
      </div>
    </div>
  );
}
