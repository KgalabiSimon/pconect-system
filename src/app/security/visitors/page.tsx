"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Download, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function VisitorRegisterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visitors] = useState([
    {
      id: 1,
      name: "Alice Cooper",
      type: "Visitor",
      company: "Tech Solutions Ltd",
      hostEmployee: "John Doe",
      floor: "First Floor",
      block: "Block D",
      phone: "+27 85 111 2222",
      checkInTime: "10:00 AM",
      purpose: "Business Meeting",
      photo: "AC",
    },
    {
      id: 2,
      name: "Robert Taylor",
      type: "Visitor",
      company: "Innovation Corp",
      hostEmployee: "Sarah Williams",
      floor: "Second Floor",
      block: "Block H",
      phone: "+27 86 333 4444",
      checkInTime: "09:30 AM",
      purpose: "Contract Signing",
      photo: "RT",
    },
    {
      id: 3,
      name: "Linda Martinez",
      type: "Guest",
      company: "N/A",
      hostEmployee: "Mike Johnson",
      floor: "Ground Floor",
      block: "Block A",
      phone: "+27 87 555 6666",
      checkInTime: "11:15 AM",
      purpose: "Personal Visit",
      photo: "LM",
    },
  ]);

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.hostEmployee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportRegister = () => {
    alert("Visitor register exported to CSV");
  };

  return (
    <div className="min-h-screen bg-gray-900">
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
            <span className="font-semibold">{filteredVisitors.length} Visitors in Building</span>
          </div>
        </Card>

        {/* Visitor List */}
        <div className="space-y-3">
          {filteredVisitors.map((visitor) => (
            <Card key={visitor.id} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {visitor.photo}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{visitor.name}</h3>
                      <p className="text-gray-400 text-sm">{visitor.company}</p>
                    </div>
                    <span className="text-orange-400 text-xs bg-orange-900/30 px-2 py-1 rounded">
                      {visitor.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Host:</span>
                      <span className="text-white font-medium">{visitor.hostEmployee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Purpose:</span>
                      <span className="text-gray-300">{visitor.purpose}</span>
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
                      <span className="text-gray-400">{visitor.phone}</span>
                      <span className="text-gray-500">In: {visitor.checkInTime}</span>
                    </div>
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
  );
}
