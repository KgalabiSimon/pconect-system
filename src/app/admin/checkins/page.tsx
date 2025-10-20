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
  Filter
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userType: "employee" | "visitor";
  programme?: string;
  building: string;
  floor: string;
  block: string;
  date: string;
  timeIn: string;
  timeOut: string;
  duration: string;
  laptop: string;
  // Visitor-specific fields
  hostName?: string;
  hostEmail?: string;
  company?: string;
  purpose?: string;
}

export default function CheckInHistoryPage() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([
    {
      id: "CHK-001",
      userId: "USR-001",
      userName: "John Doe",
      userType: "employee",
      programme: "Programme 1A",
      building: "Building 41",
      floor: "Ground Floor",
      block: "Block A",
      date: "2025-10-15",
      timeIn: "08:30 AM",
      timeOut: "05:45 PM",
      duration: "9h 15m",
      laptop: "Dell Latitude 5420"
    },
    {
      id: "CHK-002",
      userId: "USR-002",
      userName: "Sarah Williams",
      userType: "employee",
      programme: "Programme 2",
      building: "Building 42",
      floor: "First Floor",
      block: "Block D",
      date: "2025-10-14",
      timeIn: "09:00 AM",
      timeOut: "06:15 PM",
      duration: "9h 15m",
      laptop: "HP EliteBook 840"
    },
    {
      id: "CHK-003",
      userId: "VIS-001",
      userName: "Michael Chen",
      userType: "visitor",
      building: "Building 41",
      floor: "Ground Floor",
      block: "Block C",
      date: "2025-10-15",
      timeIn: "10:00 AM",
      timeOut: "02:30 PM",
      duration: "4h 30m",
      laptop: "No laptop",
      hostName: "John Doe",
      hostEmail: "john.doe@example.com",
      company: "Tech Solutions Inc",
      purpose: "Business Meeting"
    },
    {
      id: "CHK-004",
      userId: "USR-003",
      userName: "Mike Johnson",
      userType: "employee",
      programme: "Programme 1B",
      building: "DSTI",
      floor: "Ground Floor",
      block: "Block B",
      date: "2025-10-13",
      timeIn: "08:45 AM",
      timeOut: "05:30 PM",
      duration: "8h 45m",
      laptop: "Lenovo ThinkPad X1"
    },
    {
      id: "CHK-005",
      userId: "VIS-002",
      userName: "Lisa Anderson",
      userType: "visitor",
      building: "Building 42",
      floor: "First Floor",
      block: "Block E",
      date: "2025-10-14",
      timeIn: "09:30 AM",
      timeOut: "11:45 AM",
      duration: "2h 15m",
      laptop: "No laptop",
      hostName: "Sarah Williams",
      hostEmail: "sarah.w@example.com",
      company: "Consulting Partners",
      purpose: "Project Review"
    },
    {
      id: "CHK-006",
      userId: "VIS-003",
      userName: "David Martinez",
      userType: "visitor",
      building: "DSTI",
      floor: "Ground Floor",
      block: "Block A",
      date: "2025-10-15",
      timeIn: "02:00 PM",
      timeOut: "04:30 PM",
      duration: "2h 30m",
      laptop: "No laptop",
      hostName: "Mike Johnson",
      hostEmail: "mike.j@example.com",
      company: "Innovation Labs",
      purpose: "Technical Consultation"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterUserType, setFilterUserType] = useState("all");

  useEffect(() => {
    const isAdminLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      router.push("/admin/login");
    }
  }, [router]);

  const filteredCheckIns = checkIns.filter((checkIn) => {
    const matchesSearch =
      checkIn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checkIn.hostName && checkIn.hostName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFloor = !filterFloor || filterFloor === "all" || checkIn.floor === filterFloor;
    const matchesBlock = !filterBlock || filterBlock === "all" || checkIn.block === filterBlock;
    const matchesProgramme = !filterProgramme || filterProgramme === "all" || checkIn.programme === filterProgramme;
    const matchesBuilding = !filterBuilding || filterBuilding === "all" || checkIn.building === filterBuilding;
    const matchesDate = !filterDate || checkIn.date === filterDate;
    const matchesUserType = filterUserType === "all" || checkIn.userType === filterUserType;

    return matchesSearch && matchesFloor && matchesBlock && matchesProgramme && matchesBuilding && matchesDate && matchesUserType;
  });

  const exportCheckIns = () => {
    const csv = [
      ["ID", "User", "Type", "Programme/Company", "Host", "Building", "Floor", "Block", "Date", "Time In", "Time Out", "Duration", "Laptop", "Purpose"],
      ...filteredCheckIns.map((c) => [
        c.id,
        c.userName,
        c.userType === "employee" ? "Employee" : "Visitor",
        c.userType === "employee" ? (c.programme || "") : (c.company || ""),
        c.userType === "visitor" ? (c.hostName || "") : "N/A",
        c.building,
        c.floor,
        c.block,
        c.date,
        c.timeIn,
        c.timeOut,
        c.duration,
        c.laptop,
        c.purpose || "N/A"
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin-history-${filterUserType}.csv`;
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
              <h1 className="text-xl font-bold text-gray-900">Check-In History</h1>
              <p className="text-sm text-gray-600">{filteredCheckIns.length} records found</p>
            </div>
          </div>
          <Button
            onClick={exportCheckIns}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="text-sm opacity-90">Total Check-Ins</div>
            <div className="text-2xl font-bold">{filteredCheckIns.length}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90">Employees</div>
            <div className="text-2xl font-bold">
              {filteredCheckIns.filter((c) => c.userType === "employee").length}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90">Visitors</div>
            <div className="text-2xl font-bold">
              {filteredCheckIns.filter((c) => c.userType === "visitor").length}
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, ID, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={filterUserType} onValueChange={setFilterUserType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="employee">Employees Only</SelectItem>
                <SelectItem value="visitor">Visitors Only</SelectItem>
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

            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                <SelectItem value="First Floor">First Floor</SelectItem>
                <SelectItem value="Second Floor">Second Floor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBlock} onValueChange={setFilterBlock}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                <SelectItem value="Block A">Block A</SelectItem>
                <SelectItem value="Block B">Block B</SelectItem>
                <SelectItem value="Block C">Block C</SelectItem>
                <SelectItem value="Block D">Block D</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Check-Ins List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredCheckIns.map((checkIn) => (
            <Card key={checkIn.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">{checkIn.userName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      checkIn.userType === "employee"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {checkIn.userType === "employee" ? "Employee" : "Visitor"}
                    </span>
                    {checkIn.userType === "employee" && checkIn.programme && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {checkIn.programme}
                      </span>
                    )}
                    {checkIn.userType === "visitor" && checkIn.company && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {checkIn.company}
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {checkIn.id}
                    </span>
                  </div>

                  {/* Visitor: Show Host Information */}
                  {checkIn.userType === "visitor" && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Host:</span>{" "}
                          <span className="font-medium text-purple-900">{checkIn.hostName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Purpose:</span>{" "}
                          <span className="font-medium text-purple-900">{checkIn.purpose}</span>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <div className="font-medium text-orange-700">{checkIn.timeOut}</div>
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
                  </div>
                </div>

                <Link href={`/admin/users/${checkIn.userId}`}>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredCheckIns.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No check-ins found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
