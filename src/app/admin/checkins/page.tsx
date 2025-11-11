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
  Calendar,
  Clock,
  MapPin,
  Filter,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckInResponse } from "@/types/api";
import { userService } from "@/lib/api/users";
import { buildingsService } from "@/lib/api/buildings";

interface DisplayCheckIn {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: "employee" | "visitor";
  programme?: string;
  building: string;
  floor: string;
  block: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  duration: string;
  laptop: string;
  status: "checked_in" | "checked_out" | "pending";
}

export default function CheckInHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { filterCheckIns, isLoading, error } = useCheckIns();
  
  const [viewMode, setViewMode] = useState<"active" | "all">("active");
  const [checkIns, setCheckIns] = useState<DisplayCheckIn[]>([]);
  const [rawCheckIns, setRawCheckIns] = useState<CheckInResponse[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterDate, setFilterDate] = useState("");
  
  // Options for dropdowns
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      if (!isAuthenticated) return;
      
      try {
        const buildingsData = await buildingsService.getBuildings();
        setBuildings(buildingsData.map(b => ({ id: b.id, name: b.name })));
      } catch (err: any) {
        // Building fetch error is non-critical - can still view check-ins
        const errorMessage = err?.message || "Failed to load buildings. Building filter may not work correctly.";
        // Don't show toast - just log for debugging
      }
    };
    
    if (isAuthenticated) {
      fetchBuildings();
    }
  }, [isAuthenticated]);

  // Fetch check-ins with server-side filtering
  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!isAuthenticated) return;

      try {
        // Build filter parameters for the API
        const filterParams: any = {};
        
        if (viewMode === "active") {
          // Fetch only active check-ins (status = checked_in)
          filterParams.status = 'checked_in';
        }
        
        // Apply date filter - use filterDate if set, otherwise default to today for "all" mode
        if (filterDate) {
          const selectedDate = new Date(filterDate);
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);
          filterParams.start_date = startDate.toISOString();
          filterParams.end_date = endDate.toISOString();
        } else if (viewMode === "all") {
          // Default to today for "all" mode
          const today = new Date();
          const startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          filterParams.start_date = startDate.toISOString();
          filterParams.end_date = endDate.toISOString();
        }
        
        // Apply floor filter if set
        if (filterFloor && filterFloor !== "all") {
          filterParams.floor = filterFloor;
        }
        
        // Apply block filter if set
        if (filterBlock && filterBlock !== "all") {
          filterParams.block = filterBlock;
        }
        
        // Apply building filter if set
        if (filterBuilding && filterBuilding !== "all") {
          filterParams.building_id = filterBuilding;
        }
        
        const data = await filterCheckIns(filterParams);

        // Transform API response to display format
        const transformedData = await Promise.all(
          data.map(async (checkIn) => {
            // Fetch user details
            let userName = "Unknown User";
            let userEmail = "";
            let userType: "employee" | "visitor" = "employee";
            
            if (checkIn.user_id) {
              try {
                const user = await userService.getUserById(checkIn.user_id);
                userName = `${user.first_name} ${user.last_name}`;
                userEmail = user.email;
                userType = "employee"; // Regular users are employees
              } catch (err) {
                // User fetch error is non-critical - can still display check-in
                // User name will remain "Unknown User"
              }
            }

            const checkInTime = new Date(checkIn.check_in_time);
            const checkOutTime = checkIn.check_out_time ? new Date(checkIn.check_out_time) : null;
            
            // Calculate duration
            let duration = "N/A";
            if (checkOutTime) {
              const diffMs = checkOutTime.getTime() - checkInTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              duration = `${hours}h ${minutes}m`;
            } else if (viewMode === "active") {
              // Calculate duration for active check-ins
              const diffMs = Date.now() - checkInTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              duration = `${hours}h ${minutes}m (ongoing)`;
            }

            return {
              id: checkIn.id,
              userId: checkIn.user_id || "",
              userName,
              userEmail,
              userType,
              programme: checkIn.programme_id, // Would need to fetch programme name
              building: checkIn.building_id || "N/A", // Would need to fetch building name
              floor: checkIn.floor || "N/A",
              block: checkIn.block || "N/A",
              date: checkInTime.toISOString().split('T')[0],
              timeIn: checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              timeOut: checkOutTime 
                ? checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : null,
              duration,
              laptop: checkIn.laptop_model || "None",
              status: checkIn.status,
            } as DisplayCheckIn;
          })
        );

        setRawCheckIns(data);
        setCheckIns(transformedData);
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load check-ins. Please try again.";
        setCheckIns([]);
        // Error will be displayed via error from hook if available
      }
    };

    if (isAuthenticated) {
      fetchCheckIns();
    }
  }, [isAuthenticated, viewMode, filterFloor, filterBlock, filterBuilding, filterDate, filterCheckIns]);

  const filteredCheckIns = checkIns.filter((checkIn) => {
    const matchesSearch =
      checkIn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFloor = !filterFloor || filterFloor === "all" || checkIn.floor === filterFloor;
    const matchesBlock = !filterBlock || filterBlock === "all" || checkIn.block === filterBlock;
    const matchesBuilding = !filterBuilding || filterBuilding === "all" || checkIn.building === filterBuilding;
    const matchesDate = !filterDate || checkIn.date === filterDate;

    return matchesSearch && matchesFloor && matchesBlock && matchesBuilding && matchesDate;
  });

  const exportCheckIns = () => {
    const csv = [
      ["ID", "User", "Email", "Building", "Floor", "Block", "Date", "Time In", "Time Out", "Duration", "Laptop", "Status"],
      ...filteredCheckIns.map((c) => [
        c.id,
        c.userName,
        c.userEmail,
        c.building,
        c.floor,
        c.block,
        c.date,
        c.timeIn,
        c.timeOut || "N/A",
        c.duration,
        c.laptop,
        c.status === "checked_in" ? "Active" : c.status === "checked_out" ? "Completed" : "Pending",
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-in history...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Check-In History</h1>
              <p className="text-sm text-gray-600">{filteredCheckIns.length} records found</p>
            </div>
          </div>
          <Button
            onClick={exportCheckIns}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={filteredCheckIns.length === 0}
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
        </div>
      </div>

        {/* View Mode Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "active" ? "default" : "outline"}
                onClick={() => setViewMode("active")}
                className="flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Active Check-Ins
              </Button>
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                onClick={() => setViewMode("all")}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                All Check-Ins (Today)
              </Button>
            </div>
          </div>
        </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
              <div className="text-sm opacity-90">Total {viewMode === "active" ? "Active" : "Today"}</div>
            <div className="text-2xl font-bold">{filteredCheckIns.length}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="text-sm opacity-90">Checked In</div>
            <div className="text-2xl font-bold">
                {filteredCheckIns.filter((c) => c.status === "checked_in").length}
            </div>
          </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="text-sm opacity-90">Completed</div>
            <div className="text-2xl font-bold">
                {filteredCheckIns.filter((c) => c.status === "checked_out").length}
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                  placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={filterBuilding} onValueChange={setFilterBuilding}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {Array.from(new Set(rawCheckIns.map(c => c.floor).filter((f): f is string => Boolean(f)))).sort().map(floor => (
                  <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBlock} onValueChange={setFilterBlock}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {Array.from(new Set(rawCheckIns.map(c => c.block).filter((b): b is string => Boolean(b)))).sort().map(block => (
                  <SelectItem key={block} value={block}>{block}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-10 max-w-xs"
            />
          </div>
        </div>
      </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading check-ins...</p>
            </div>
          </div>
        )}

      {/* Check-Ins List */}
        {!isLoading && (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredCheckIns.map((checkIn) => (
            <Card key={checkIn.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">{checkIn.userName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                          checkIn.status === "checked_in"
                            ? "bg-green-100 text-green-700"
                            : checkIn.status === "checked_out"
                        ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                    }`}>
                          {checkIn.status === "checked_in" ? "ACTIVE" : 
                           checkIn.status === "checked_out" ? "COMPLETED" : 
                           "PENDING"}
                      </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {checkIn.id.substring(0, 8)}...
                    </span>
                      </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                    <div>
                      <div className="text-gray-600 text-xs">Date</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {checkIn.date}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Time In</div>
                      <div className="font-medium text-green-700">{checkIn.timeIn}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Time Out</div>
                          <div className="font-medium text-orange-700">{checkIn.timeOut || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Duration</div>
                      <div className="font-medium text-blue-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {checkIn.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{checkIn.building} • {checkIn.floor} • {checkIn.block}</span>
                    </div>
                        {checkIn.laptop && checkIn.laptop !== "None" && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            💻 {checkIn.laptop}
                          </span>
                        )}
                  </div>
                </div>

                    {checkIn.userId && (
                <Link href={`/admin/users/${checkIn.userId}`}>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </Link>
                    )}
              </div>
            </Card>
          ))}
        </div>

            {filteredCheckIns.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {viewMode === "active" 
                    ? "No active check-ins found" 
                    : "No check-ins found matching your filters"}
                </p>
                {viewMode === "active" && (
                  <p className="text-sm text-gray-500 mt-2">
                    All users have checked out or no check-ins were created today.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
