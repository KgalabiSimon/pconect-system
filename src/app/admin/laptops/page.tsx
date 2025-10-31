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
  Search,
  Download,
  Laptop,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

interface LaptopRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  registeredLaptop: string;
  registeredAssetNumber: string;
  checkedInLaptop: string;
  checkedInAssetNumber: string;
  isMatch: boolean;
  building: string;
  floor: string;
  block: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate?: string;
  checkOutTime?: string;
  checkedOutBySecurityOfficer?: string;
  securityOfficerBadge?: string;
  status: "checked_in" | "checked_out";
  duration?: string;
}

export default function LaptopsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [laptopRecords, setLaptopRecords] = useState<LaptopRecord[]>([
    {
      id: "LAP-001",
      employeeId: "USR-001",
      employeeName: "John Doe",
      registeredLaptop: "Dell Latitude 5420",
      registeredAssetNumber: "DST-001",
      checkedInLaptop: "Dell Latitude 5420",
      checkedInAssetNumber: "DST-001",
      isMatch: true,
      building: "Building 41",
      floor: "Ground Floor",
      block: "Block A",
      checkInDate: "2025-10-15",
      checkInTime: "08:30 AM",
      status: "checked_in"
    },
    {
      id: "LAP-002",
      employeeId: "USR-002",
      employeeName: "Sarah Williams",
      registeredLaptop: "HP EliteBook 840",
      registeredAssetNumber: "DST-002",
      checkedInLaptop: "HP EliteBook 840",
      checkedInAssetNumber: "DST-002",
      isMatch: true,
      building: "Building 42",
      floor: "First Floor",
      block: "Block D",
      checkInDate: "2025-10-14",
      checkInTime: "09:00 AM",
      checkOutDate: "2025-10-14",
      checkOutTime: "06:15 PM",
      checkedOutBySecurityOfficer: "Officer Mike Thompson",
      securityOfficerBadge: "SEC-045",
      status: "checked_out",
      duration: "9h 15m"
    },
    {
      id: "LAP-003",
      employeeId: "USR-003",
      employeeName: "Mike Johnson",
      registeredLaptop: "Lenovo ThinkPad X1",
      registeredAssetNumber: "DST-003",
      checkedInLaptop: "Dell Latitude 5420",
      checkedInAssetNumber: "DST-001",
      isMatch: false,
      building: "DSTI",
      floor: "Ground Floor",
      block: "Block B",
      checkInDate: "2025-10-15",
      checkInTime: "10:15 AM",
      status: "checked_in"
    },
    {
      id: "LAP-004",
      employeeId: "USR-004",
      employeeName: "Emma Davis",
      registeredLaptop: "MacBook Pro 14",
      registeredAssetNumber: "DST-012",
      checkedInLaptop: "MacBook Pro 14",
      checkedInAssetNumber: "DST-012",
      isMatch: true,
      building: "Building 41",
      floor: "Second Floor",
      block: "Block G",
      checkInDate: "2025-10-15",
      checkInTime: "08:45 AM",
      checkOutDate: "2025-10-15",
      checkOutTime: "01:30 PM",
      checkedOutBySecurityOfficer: "Officer Sarah Brown",
      securityOfficerBadge: "SEC-023",
      status: "checked_out",
      duration: "4h 45m"
    },
    {
      id: "LAP-005",
      employeeId: "USR-005",
      employeeName: "David Martinez",
      registeredLaptop: "HP ZBook Studio",
      registeredAssetNumber: "DST-007",
      checkedInLaptop: "Lenovo ThinkPad X1",
      checkedInAssetNumber: "DST-003",
      isMatch: false,
      building: "Building 42",
      floor: "Ground Floor",
      block: "Block C",
      checkInDate: "2025-10-15",
      checkInTime: "09:30 AM",
      status: "checked_in"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMatch, setFilterMatch] = useState("all");
  const [filterBuilding, setFilterBuilding] = useState("all");

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAdminLoggedIn = sessionStorage.getItem("adminLoggedIn");
        if (!isAdminLoggedIn) {
          router.push("/admin/login");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const filteredRecords = laptopRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.checkedInLaptop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.checkedInAssetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;

    const matchesMatch =
      filterMatch === "all" ||
      (filterMatch === "match" && record.isMatch) ||
      (filterMatch === "mismatch" && !record.isMatch);

    const matchesBuilding =
      filterBuilding === "all" || record.building === filterBuilding;

    return matchesSearch && matchesStatus && matchesMatch && matchesBuilding;
  });

  const stats = {
    total: laptopRecords.length,
    checkedIn: laptopRecords.filter((r) => r.status === "checked_in").length,
    checkedOut: laptopRecords.filter((r) => r.status === "checked_out").length,
    mismatches: laptopRecords.filter((r) => !r.isMatch).length,
    checkedInMismatches: laptopRecords.filter((r) => r.status === "checked_in" && !r.isMatch).length,
  };

  const exportLaptops = () => {
    try {
      const csv = [
        ["ID", "Employee", "Employee ID", "Registered Laptop", "Registered Asset", "Checked-In Laptop", "Checked-In Asset", "Match", "Status", "Building", "Floor", "Block", "Check-In Date", "Check-In Time", "Check-Out Date", "Check-Out Time", "Duration", "Security Officer", "Officer Badge"],
        ...filteredRecords.map((r) => [
          r.id,
          r.employeeName,
          r.employeeId,
          r.registeredLaptop,
          r.registeredAssetNumber,
          r.checkedInLaptop,
          r.checkedInAssetNumber,
          r.isMatch ? "Match" : "MISMATCH",
          r.status === "checked_in" ? "Checked In" : "Checked Out",
          r.building,
          r.floor,
          r.block,
          r.checkInDate,
          r.checkInTime,
          r.checkOutDate || "N/A",
          r.checkOutTime || "N/A",
          r.duration || "N/A",
          r.checkedOutBySecurityOfficer || "N/A",
          r.securityOfficerBadge || "N/A"
        ])
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laptop-tracking-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert(`Successfully exported ${filteredRecords.length} laptop records!`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading laptop tracking...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  return (
    <ProtectedRoute>
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
              <h1 className="text-xl font-bold text-gray-900">Laptop Tracking</h1>
              <p className="text-sm text-gray-600">{filteredRecords.length} records found</p>
            </div>
          </div>
          <Button
            onClick={exportLaptops}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Laptop className="w-5 h-5 opacity-80" />
              <div className="text-sm opacity-90">Total Laptops</div>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              <div className="text-sm opacity-90">Checked In</div>
            </div>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 opacity-80" />
              <div className="text-sm opacity-90">Checked Out</div>
            </div>
            <div className="text-2xl font-bold">{stats.checkedOut}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 opacity-80" />
              <div className="text-sm opacity-90">Total Mismatches</div>
            </div>
            <div className="text-2xl font-bold">{stats.mismatches}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 opacity-80" />
              <div className="text-sm opacity-90">Unchecked Mismatches</div>
            </div>
            <div className="text-2xl font-bold">{stats.checkedInMismatches}</div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employee, laptop, asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="checked_in">Checked In Only</SelectItem>
                <SelectItem value="checked_out">Checked Out Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMatch} onValueChange={setFilterMatch}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Laptops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Laptops</SelectItem>
                <SelectItem value="match">Registered Match</SelectItem>
                <SelectItem value="mismatch">Mismatches Only</SelectItem>
              </SelectContent>
            </Select>

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
        </div>
      </div>

      {/* Laptop Records */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className={`p-6 ${
                !record.isMatch && record.status === "checked_in"
                  ? "border-2 border-red-500 bg-red-50"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{record.employeeName}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {record.employeeId}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {record.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.isMatch ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Registered Laptop
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-medium animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        UNREGISTERED LAPTOP
                      </span>
                    )}
                    <span
                      className={`text-xs px-3 py-1 rounded font-medium ${
                        record.status === "checked_in"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {record.status === "checked_in" ? "Currently In Building" : "Checked Out"}
                    </span>
                  </div>
                </div>

                {/* Laptop Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registered Laptop */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-2 font-medium">
                      REGISTERED LAPTOP
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Laptop className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">{record.registeredLaptop}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Asset: <span className="font-mono">{record.registeredAssetNumber}</span>
                    </div>
                  </div>

                  {/* Checked-In Laptop */}
                  <div
                    className={`p-4 rounded-lg border ${
                      record.isMatch
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <div className="text-xs font-medium mb-2">
                      <span className={record.isMatch ? "text-green-700" : "text-red-700"}>
                        CHECKED-IN LAPTOP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Laptop className={`w-5 h-5 ${record.isMatch ? "text-green-600" : "text-red-600"}`} />
                      <span className="font-semibold">{record.checkedInLaptop}</span>
                    </div>
                    <div className="text-sm">
                      <span className={record.isMatch ? "text-green-700" : "text-red-700"}>
                        Asset: <span className="font-mono">{record.checkedInAssetNumber}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mismatch Alert */}
                {!record.isMatch && (
                  <div className="p-4 bg-red-100 border-l-4 border-red-600 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-red-700" />
                      <span className="font-bold text-red-900">SECURITY ALERT</span>
                    </div>
                    <p className="text-sm text-red-800">
                      Employee checked in with laptop <strong>{record.checkedInLaptop}</strong> (
                      {record.checkedInAssetNumber}), which is NOT registered to them. Their
                      registered laptop is <strong>{record.registeredLaptop}</strong> (
                      {record.registeredAssetNumber}).
                    </p>
                  </div>
                )}

                {/* Check-In/Out Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs">Building</div>
                    <div className="font-medium">{record.building}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Location</div>
                    <div className="font-medium">
                      {record.floor} • {record.block}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Check-In</div>
                    <div className="font-medium">
                      {record.checkInDate} {record.checkInTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Check-Out</div>
                    <div className="font-medium">
                      {record.checkOutDate && record.checkOutTime
                        ? `${record.checkOutDate} ${record.checkOutTime}`
                        : "Still in building"}
                    </div>
                  </div>
                </div>

                {/* Security Check-Out Info */}
                {record.status === "checked_out" && record.checkedOutBySecurityOfficer && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-900">
                          Verified & Checked Out by Security
                        </div>
                        <div className="text-xs text-blue-700">
                          Officer: {record.checkedOutBySecurityOfficer} (
                          {record.securityOfficerBadge}) • Duration: {record.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Laptop className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No laptop records found</p>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
