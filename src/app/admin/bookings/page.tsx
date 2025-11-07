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
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  Mail,
  Download,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useBookings } from "@/hooks/api/useBookings";
import { useUsers } from "@/hooks/api/useUsers";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { BookingResponse } from "@/types/api";

export default function BookingManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getAdminBookings, updateBooking, deleteBooking, isLoading, error, clearError } = useBookings();
  const { users, loadUsers } = useUsers({ initialLoad: false });
  const { buildings, loadBuildings } = useBuildings({ initialLoad: false });
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [userMap, setUserMap] = useState<Record<string, { name: string; email: string }>>({});
  const [buildingMap, setBuildingMap] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [loadingErrors, setLoadingErrors] = useState<{
    bookings?: string;
    users?: string;
    buildings?: string;
  }>({});
  const { success, error: showError, ToastContainer } = useToast();

  // Load bookings and related data
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
      loadUsersData();
      loadBuildingsData();
    }
  }, [isAuthenticated]);

  // Reload bookings when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [filterType, filterBuilding, filterDate, filterStatus, isAuthenticated]);

  const loadBookings = async () => {
    try {
      clearError();
      setLoadingErrors({ ...loadingErrors, bookings: undefined });
      const params: any = {};
      
      if (filterType && filterType !== "all") {
        params.space_type = filterType.toUpperCase() as 'DESK' | 'OFFICE' | 'ROOM';
      }
      
      if (filterBuilding && filterBuilding !== "all") {
        params.building_id = filterBuilding;
      }
      
      if (filterDate) {
        params.booking_date = filterDate;
      }
      
      if (filterStatus && filterStatus !== "all") {
        params.status = filterStatus;
      }
      
      const data = await getAdminBookings(params);
      setBookings(data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load bookings. Please try again.';
      setLoadingErrors({ ...loadingErrors, bookings: errorMessage });
      showError(errorMessage);
    }
  };

  const loadUsersData = async () => {
    try {
      setLoadingErrors({ ...loadingErrors, users: undefined });
      await loadUsers();
      // Build user map for quick lookup
      const map: Record<string, { name: string; email: string }> = {};
      users.forEach(user => {
        map[user.id] = {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        };
      });
      setUserMap(map);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load users. Some names may not display correctly.';
      setLoadingErrors({ ...loadingErrors, users: errorMessage });
      // Don't show toast for this as it's not critical - users can still see bookings
    }
  };

  const loadBuildingsData = async () => {
    try {
      setLoadingErrors({ ...loadingErrors, buildings: undefined });
      await loadBuildings();
      // Build building map for quick lookup
      const map: Record<string, string> = {};
      buildings.forEach(building => {
        map[building.id] = building.name;
      });
      setBuildingMap(map);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load buildings. Some building names may not display correctly.';
      setLoadingErrors({ ...loadingErrors, buildings: errorMessage });
      // Don't show toast for this as it's not critical - bookings can still be viewed
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking management...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  const filteredBookings = bookings.filter((booking) => {
    const user = userMap[booking.user_id];
    const userName = user?.name || 'Unknown User';
    const userEmail = user?.email || '';
    
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Get space_type from booking.space_type or fallback to booking.space?.type
    const spaceType = booking.space_type || booking.space?.type;
    const matchesType = !filterType || filterType === "all" || 
      (filterType === "desk" && spaceType === "DESK") ||
      (filterType === "office" && spaceType === "OFFICE") ||
      (filterType === "meeting_room" && spaceType === "ROOM");
    
    // Note: BookingResponse doesn't have building_id directly, but we can filter by it if available
    // For now, we'll check if the booking has a building_id field or skip building filter
    const matchesBuilding = !filterBuilding || filterBuilding === "all" || 
      (booking as any).building_id === filterBuilding;
    const matchesDate = !filterDate || booking.booking_date.split('T')[0] === filterDate;
    const matchesStatus = !filterStatus || filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesType && matchesBuilding && matchesDate && matchesStatus;
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const bookingsToday = bookings.filter(
    (b) => {
      const bookingDate = b.booking_date.split('T')[0];
      return bookingDate === today && (b.status === "pending" || b.status === "checked_in");
    }
  ).length;

  const bookingsThisWeek = bookings.filter((b) => {
    const bookingDate = new Date(b.booking_date);
    const todayDate = new Date();
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - todayDate.getDay());
    return bookingDate >= weekStart && (b.status === "pending" || b.status === "checked_in");
  }).length;

  const meetingRooms = bookings.filter(
    (b) => (b.space_type || b.space?.type) === "ROOM" && (b.status === "pending" || b.status === "checked_in")
  ).length;

  const handleDeleteClick = (id: string) => {
    setBookingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    try {
      const deleted = await deleteBooking(bookingToDelete);
      if (deleted) {
        success("Booking deleted successfully!");
        setBookings(bookings.filter((b) => b.id !== bookingToDelete));
        loadBookings(); // Reload to ensure consistency
      } else {
        showError("Failed to delete booking. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete booking. Please try again.";
      showError(errorMessage);
    } finally {
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    }
  };

  const exportBookings = () => {
    try {
      const csv = [
        ["ID", "User", "Email", "Type", "Space ID", "Building", "Date", "Time", "Status"],
        ...filteredBookings.map((b) => {
          const user = userMap[b.user_id];
          const buildingName = buildingMap[b.building_id || ''] || b.building_id || 'Unknown';
          const date = new Date(b.booking_date).toISOString().split('T')[0];
          return [
            b.id,
            user?.name || 'Unknown',
            user?.email || '',
            (b.space_type || b.space?.type) || 'N/A',
            b.space_id || 'N/A',
            buildingName,
            date,
            `${b.start_time}-${b.end_time}`,
            b.status
          ];
        })
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      success(`Successfully exported ${filteredBookings.length} bookings to CSV!`);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to export bookings. Please try again.";
      showError(errorMessage);
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer />
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setBookingToDelete(null);
        }}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
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
              <h1 className="text-xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-sm text-gray-600">{filteredBookings.length} bookings found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportBookings}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Booking</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90">Today</div>
            <div className="text-2xl font-bold">{bookingsToday}</div>
            <div className="text-xs opacity-90">Bookings</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90">This Week</div>
            <div className="text-2xl font-bold">{bookingsThisWeek}</div>
            <div className="text-xs opacity-90">Bookings</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90">Meeting Rooms</div>
            <div className="text-2xl font-bold">{meetingRooms}</div>
            <div className="text-xs opacity-90">Active</div>
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
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="desk">Desk</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="meeting_room">Meeting Room</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBuilding} onValueChange={setFilterBuilding}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-10"
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

      {/* Loading Errors (non-critical) */}
      {(loadingErrors.users || loadingErrors.buildings) && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-sm">
            {loadingErrors.users && (
              <p className="text-amber-700 mb-1">{loadingErrors.users}</p>
            )}
            {loadingErrors.buildings && (
              <p className="text-amber-700">{loadingErrors.buildings}</p>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && bookings.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const user = userMap[booking.user_id];
            const userName = user?.name || 'Unknown User';
            const userEmail = user?.email || '';
            // Note: BookingResponse may not have building_id directly, check if available
            const buildingId = (booking as any).building_id;
            const buildingName = buildingId ? (buildingMap[buildingId] || buildingId) : 'Unknown Building';
            const bookingDate = new Date(booking.booking_date);
            const displayDate = bookingDate.toISOString().split('T')[0];
            const spaceType = booking.space_type || booking.space?.type;
            const spaceTypeDisplay = spaceType === 'DESK' ? 'Desk' : 
                                    spaceType === 'OFFICE' ? 'Office' : 
                                    spaceType === 'ROOM' ? 'Meeting Room' : spaceType || 'Unknown';
            
            return (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">Space ID: {booking.space_id?.substring(0, 8)}...</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        spaceType === "ROOM"
                          ? "bg-purple-100 text-purple-700"
                          : spaceType === "OFFICE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {spaceTypeDisplay}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === "checked_in" 
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "checked_out"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {booking.status === "checked_in" ? "Checked In" :
                         booking.status === "pending" ? "Pending" :
                         booking.status === "checked_out" ? "Checked Out" :
                         booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{displayDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                      <div className="text-gray-600">
                        {buildingName}
                      </div>
                    </div>

                    {booking.qr_code_url && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>QR Code: Available</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" title="Edit Booking">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(booking.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
