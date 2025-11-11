"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Download, Users, RefreshCcw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCheckIns } from "@/hooks/api/useCheckIns";
import { useToast } from "@/components/ui/toast";
import { useBuildings } from "@/hooks/api/useBuildings";
import type { CheckInResponse } from "@/types/api";

interface RegisterEntry {
  id: string;
  name: string;
  buildingName: string;
  floor: string;
  block: string;
  phone: string;
  checkInTime: string;
  initials: string;
}

export default function CheckInRegisterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [registerEntries, setRegisterEntries] = useState<CheckInResponse[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const { filterCheckIns, isLoading, error, clearError } = useCheckIns();
  const { buildings, loadBuildings } = useBuildings({ initialLoad: false });
  const { success: showSuccess, error: showError, ToastContainer } = useToast();

  useEffect(() => {
    if (buildings.length === 0) {
      loadBuildings();
    }
  }, [buildings.length, loadBuildings]);

  const buildingMap = useMemo(() => {
    const map: Record<string, string> = {};
    buildings.forEach((building) => {
      map[building.id] = building.name || building.building_code || "Unknown Building";
    });
    return map;
  }, [buildings]);

  const fetchRegister = useCallback(async () => {
    try {
      setIsFetching(true);
      clearError();
      const results = await filterCheckIns({ status: "checked_in", user_type: "employee" });
      setRegisterEntries(results);
    } catch (err: any) {
      const message = err?.message || "Failed to load employee register. Please try again.";
      showError(message);
    } finally {
      setIsFetching(false);
    }
  }, [clearError, filterCheckIns, showError]);

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  const displayEntries = useMemo<RegisterEntry[]>(() => {
    const toInitials = (value: string) => {
      if (!value) return "";
      const parts = value.trim().split(/\s+/);
      return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
    };

    return registerEntries
      .map((entry) => {
        const firstName = entry.user?.first_name ?? "";
        const lastName = entry.user?.last_name ?? "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Employee";
        const buildingName = entry.building_id ? buildingMap[entry.building_id] ?? "Unknown Building" : "Unknown Building";
        const floor = entry.floor || "Unknown Floor";
        const block = entry.block || "Unknown Block";
        const phone = entry.user?.phone || "Not provided";
        const checkInTime = entry.check_in_time
          ? new Date(entry.check_in_time).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
          : "--:--";

        return {
          id: entry.id,
          name: fullName,
          buildingName,
          floor,
          block,
          phone,
          checkInTime,
          initials: toInitials(fullName),
        };
      })
      .filter((entry) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          entry.name.toLowerCase().includes(term) ||
          entry.buildingName.toLowerCase().includes(term) ||
          entry.floor.toLowerCase().includes(term) ||
          entry.block.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [buildingMap, registerEntries, searchTerm]);

  const exportRegister = () => {
    if (displayEntries.length === 0) {
      showError("No active employees to export.");
      return;
    }

    const rows = [
      ["Name", "Building", "Floor", "Block", "Phone", "Check-In Time"],
      ...displayEntries.map((entry) => [entry.name, entry.buildingName, entry.floor, entry.block, entry.phone, entry.checkInTime]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `employee-register-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showSuccess(`Exported ${displayEntries.length} records.`);
  };

  const isBusy = isLoading || isFetching;

  return (
    <ProtectedRoute>
      <ToastContainer />
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/security" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Employee Check-In Register</h1>
              <p className="text-xs text-gray-400">Live list of employees currently checked in</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchRegister}
                variant="outline"
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                disabled={isBusy}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isBusy ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={exportRegister}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                disabled={displayEntries.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, building, floor, or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <Card className="bg-red-50 border-red-200 p-4">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                  <p className="text-xs text-red-600 mt-1">Please try refreshing the register.</p>
                </div>
                <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
              </div>
            </Card>
          )}

          {/* Stats */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{displayEntries.length} Active Employees</span>
            </div>
          </Card>

          {/* Loading State */}
          {isBusy && (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 text-sm">Fetching latest employee check-ins...</p>
              </div>
            </Card>
          )}

          {/* Register List */}
          <div className="space-y-3">
            {displayEntries.map((entry) => (
              <Card key={entry.id} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {entry.initials || "?"}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-white font-bold text-lg">{entry.name}</h3>
                        <p className="text-gray-400 text-sm">Employee</p>
                      </div>
                      <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                        Checked In
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Building</p>
                        <p className="text-white font-medium">{entry.buildingName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Floor & Block</p>
                        <p className="text-white font-medium">{entry.floor} • {entry.block}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between text-xs">
                      <span className="text-gray-400">{entry.phone}</span>
                      <span className="text-gray-500">In: {entry.checkInTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {displayEntries.length === 0 && !isBusy && (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No employees are currently checked in.</p>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
