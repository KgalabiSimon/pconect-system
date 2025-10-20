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

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "desk" | "office" | "meeting_room";
  building: string;
  space: string;
  floor: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  guests?: string[];
}

export default function BookingManagementPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "BK-001",
      userId: "USR-001",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      type: "meeting_room",
      building: "Building 41",
      space: "Meeting Room 3A",
      floor: "2nd Floor",
      date: "2025-10-20",
      startTime: "14:00",
      endTime: "16:00",
      status: "confirmed",
      guests: ["sarah@example.com", "mike@example.com"]
    },
    {
      id: "BK-002",
      userId: "USR-002",
      userName: "Sarah Williams",
      userEmail: "sarah.w@example.com",
      type: "desk",
      building: "Building 42",
      space: "Hot Desk 101",
      floor: "Ground Floor",
      date: "2025-10-21",
      startTime: "06:00",
      endTime: "18:00",
      status: "confirmed"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  useEffect(() => {
    const isAdminLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      router.push("/admin/login");
    }
  }, [router]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.space.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || filterType === "all" || booking.type === filterType;
    const matchesBuilding = !filterBuilding || filterBuilding === "all" || booking.building === filterBuilding;
    const matchesDate = !filterDate || booking.date === filterDate;

    return matchesSearch && matchesType && matchesBuilding && matchesDate;
  });

  // Calculate stats
  const bookingsToday = bookings.filter(
    (b) => b.date === new Date().toISOString().split('T')[0] && b.status === "confirmed"
  ).length;

  const bookingsThisWeek = bookings.filter((b) => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return bookingDate >= weekStart && b.status === "confirmed";
  }).length;

  const meetingRooms = bookings.filter(
    (b) => b.type === "meeting_room" && b.status === "confirmed"
  ).length;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter((b) => b.id !== id));
      alert("Booking deleted successfully");
    }
  };

  const exportBookings = () => {
    const csv = [
      ["ID", "User", "Email", "Type", "Space", "Building", "Date", "Time", "Status"],
      ...filteredBookings.map((b) => [
        b.id,
        b.userName,
        b.userEmail,
        b.type,
        b.space,
        b.building,
        b.date,
        `${b.startTime}-${b.endTime}`,
        b.status
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings-export.csv";
    a.click();
  };

  return (
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
                <SelectItem value="Building 41">Building 41</SelectItem>
                <SelectItem value="Building 42">Building 42</SelectItem>
                <SelectItem value="DSTI">DSTI Building</SelectItem>
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

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">{booking.space}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.type === "meeting_room"
                        ? "bg-purple-100 text-purple-700"
                        : booking.type === "office"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {booking.type.replace("_", " ")}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{booking.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="text-gray-600">
                      {booking.building} • {booking.floor}
                    </div>
                  </div>

                  {booking.guests && booking.guests.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Guests: {booking.guests.join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" title="Edit Booking">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {booking.type === "meeting_room" && (
                    <Button size="sm" variant="outline" title="Invite Guests">
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
