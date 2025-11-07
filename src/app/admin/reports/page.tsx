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
import {
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Clock,
  Building2,
  FileText,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/api/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReportsPage() {
  const { success, error: showError, ToastContainer } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");

  const reportTypes = [
    {
      id: "user-list",
      name: "User List Report",
      description: "Complete list of all registered users with details",
      icon: Users,
      color: "blue"
    },
    {
      id: "checkin-history",
      name: "Check-In History Report",
      description: "Detailed check-in/out records with duration and location",
      icon: Clock,
      color: "green"
    },
    {
      id: "booking-report",
      name: "Booking Report",
      description: "All bookings with user details and space information",
      icon: Calendar,
      color: "purple"
    },
    {
      id: "usage-stats",
      name: "Usage Statistics",
      description: "Building usage, floor occupancy, and trends",
      icon: TrendingUp,
      color: "orange"
    },
    {
      id: "monthly-summary",
      name: "Monthly Summary",
      description: "Monthly check-ins, bookings, and user activity",
      icon: FileText,
      color: "indigo"
    },
    {
      id: "programme-report",
      name: "Programme Report",
      description: "Activity breakdown by programme/department",
      icon: Building2,
      color: "teal"
    }
  ];

  const generateReport = (type: string) => {
    let csv = "";
    const dateRange = startDate && endDate ? ` (${startDate} to ${endDate})` : "";

    switch (type) {
      case "user-list":
        csv = [
          [`User List Report${dateRange}`],
          [""],
          ["ID", "First Name", "Last Name", "Email", "Phone", "Building", "Programme", "Total Check-Ins"],
          ["USR-001", "John", "Doe", "john.doe@example.com", "+27 82 123 4567", "Building 41", "Programme 1A", "45"],
          ["USR-002", "Sarah", "Williams", "sarah.w@example.com", "+27 83 987 6543", "Building 42", "Programme 2", "62"],
        ].map(row => row.join(",")).join("\n");
        break;

      case "checkin-history":
        csv = [
          [`Check-In History Report${dateRange}`],
          [""],
          ["Date", "User", "Time In", "Time Out", "Duration", "Floor", "Block", "Building"],
          ["2025-10-15", "John Doe", "08:30 AM", "05:45 PM", "9h 15m", "Ground Floor", "Block A", "Building 41"],
          ["2025-10-14", "Sarah Williams", "09:00 AM", "06:15 PM", "9h 15m", "First Floor", "Block D", "Building 42"],
        ].map(row => row.join(",")).join("\n");
        break;

      case "booking-report":
        csv = [
          [`Booking Report${dateRange}`],
          [""],
          ["ID", "User", "Type", "Space", "Building", "Date", "Time", "Status"],
          ["BK-001", "John Doe", "Meeting Room", "Meeting Room 3A", "Building 41", "2025-10-20", "14:00-16:00", "Confirmed"],
          ["BK-002", "Sarah Williams", "Desk", "Hot Desk 101", "Building 42", "2025-10-21", "06:00-18:00", "Confirmed"],
        ].map(row => row.join(",")).join("\n");
        break;

      case "usage-stats":
        csv = [
          [`Usage Statistics Report${dateRange}`],
          [""],
          ["Metric", "Value"],
          ["Total Users", "156"],
          ["Active Today", "89"],
          ["Total Check-Ins", "1,247"],
          ["Total Bookings", "342"],
          ["Most Used Floor", "Ground Floor"],
          ["Most Used Programme", "Programme 1A"],
          ["Avg Check-In Time", "8:42 AM"],
          ["Avg Check-Out Time", "5:38 PM"],
        ].map(row => row.join(",")).join("\n");
        break;

      case "monthly-summary":
        csv = [
          [`Monthly Summary Report${dateRange}`],
          [""],
          ["Month", "Check-Ins", "Bookings", "Active Users", "Total Hours"],
          ["October 2025", "325", "89", "145", "2,847"],
          ["September 2025", "412", "102", "156", "3,621"],
          ["August 2025", "389", "95", "148", "3,412"],
        ].map(row => row.join(",")).join("\n");
        break;

      case "programme-report":
        csv = [
          [`Programme Activity Report${dateRange}`],
          [""],
          ["Programme", "Users", "Check-Ins", "Bookings", "Avg Hours/User"],
          ["Programme 1A", "45", "412", "89", "8.5"],
          ["Programme 1B", "38", "356", "72", "8.2"],
          ["Programme 2", "42", "398", "85", "8.7"],
          ["Programme 3", "31", "281", "56", "7.9"],
        ].map(row => row.join(",")).join("\n");
        break;

      default:
        // Validation handled by UI - this shouldn't happen
        return;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    success(`${reportTypes.find(r => r.id === type)?.name} downloaded successfully!`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute requireAdmin>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">Generate and download detailed reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Report Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Building
              </label>
              <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Buildings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  <SelectItem value="Building 41">Building 41</SelectItem>
                  <SelectItem value="Building 42">Building 42</SelectItem>
                  <SelectItem value="DSTI">DSTI Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Programme
              </label>
              <Select value={filterProgramme} onValueChange={setFilterProgramme}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  <SelectItem value="Programme 1A">Programme 1A</SelectItem>
                  <SelectItem value="Programme 1B">Programme 1B</SelectItem>
                  <SelectItem value="Programme 2">Programme 2</SelectItem>
                  <SelectItem value="Programme 3">Programme 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const colorClasses = {
              blue: "from-blue-500 to-blue-600",
              green: "from-green-500 to-green-600",
              purple: "from-purple-500 to-purple-600",
              orange: "from-orange-500 to-orange-600",
              indigo: "from-indigo-500 to-indigo-600",
              teal: "from-teal-500 to-teal-600"
            };

            return (
              <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[report.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                <Button
                  onClick={() => generateReport(report.id)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">1,247</div>
              <div className="text-sm text-gray-600">Total Check-Ins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">342</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">89</div>
              <div className="text-sm text-gray-600">Active Today</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
