"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Download, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useVisitors } from "@/hooks/api/useVisitors";
import { useAuth } from "@/hooks/api/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { VisitorResponse } from "@/types/api";

export default function VisitorRegisterPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    visitors, 
    isLoading: visitorsLoading, 
    error, 
    loadVisitors, 
    searchVisitors,
    checkInVisitor,
    checkOutVisitor,
    getActiveVisitors,
    clearError 
  } = useVisitors();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorResponse[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<VisitorResponse[]>([]);

  // Load visitors on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadVisitors();
      loadActiveVisitors();
    }
  }, [isAuthenticated, loadVisitors, loadActiveVisitors]);

  // Filter visitors based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVisitors(visitors);
    } else {
      const filtered = visitors.filter(visitor =>
        visitor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.host_employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.mobile.includes(searchTerm)
      );
      setFilteredVisitors(filtered);
    }
  }, [searchTerm, visitors]);

  // Load active visitors
  const loadActiveVisitors = async () => {
    try {
      const active = await getActiveVisitors();
      setActiveVisitors(active);
    } catch (error) {
      console.error('Error loading active visitors:', error);
    }
  };

  const handleCheckIn = async (visitorId: string) => {
    try {
      await checkInVisitor(visitorId);
      await loadActiveVisitors(); // Refresh active visitors
    } catch (error) {
      console.error('Error checking in visitor:', error);
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      await checkOutVisitor(visitorId);
      await loadActiveVisitors(); // Refresh active visitors
    } catch (error) {
      console.error('Error checking out visitor:', error);
    }
  };

  const exportRegister = () => {
    alert("Visitor register exported to CSV");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {visitorsLoading && (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading visitors...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/security" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Visitor Register</h1>
            <p className="text-xs text-gray-400">Currently in Building 41</p>
          </div>
          <Button
            onClick={exportRegister}
            className="bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, company, or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">{activeVisitors.length} Active Visitors</span>
          </div>
        </Card>

        {/* Visitor List */}
        <div className="space-y-3">
          {filteredVisitors.map((visitor) => (
            <Card key={visitor.id} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {visitor.first_name.charAt(0)}{visitor.last_name.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{visitor.first_name} {visitor.last_name}</h3>
                      <p className="text-gray-400 text-sm">{visitor.company}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      visitor.status === 'CHECKED_IN' ? 'text-green-400 bg-green-900/30' :
                      visitor.status === 'CHECKED_OUT' ? 'text-gray-400 bg-gray-900/30' :
                      'text-orange-400 bg-orange-900/30'
                    }`}>
                      {visitor.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Host:</span>
                      <span className="text-white font-medium">{visitor.host_employee_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Purpose:</span>
                      <span className="text-gray-300">{visitor.visit_purpose}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-gray-500 text-xs">Floor</p>
                      <p className="text-white font-medium">{visitor.floor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Block</p>
                      <p className="text-white font-medium">{visitor.block}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{visitor.mobile}</span>
                      <span className="text-gray-500">
                        {visitor.check_in_time ? `In: ${new Date(visitor.check_in_time).toLocaleTimeString()}` : 'Not checked in'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {visitor.status === 'REGISTERED' && (
                      <Button
                        onClick={() => handleCheckIn(visitor.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Check In
                      </Button>
                    )}
                    {visitor.status === 'CHECKED_IN' && (
                      <Button
                        onClick={() => handleCheckOut(visitor.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredVisitors.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">No visitors found</p>
          </Card>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
