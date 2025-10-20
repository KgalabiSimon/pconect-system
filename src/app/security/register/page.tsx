"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Download, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckInRegisterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [peopleInBuilding] = useState([
    {
      id: 1,
      name: "John Doe",
      type: "Employee",
      floor: "Ground Floor",
      block: "Block A",
      phone: "+27 82 123 4567",
      checkInTime: "08:30 AM",
      photo: "JD",
    },
    {
      id: 2,
      name: "Sarah Williams",
      type: "Employee",
      floor: "First Floor",
      block: "Block D",
      phone: "+27 83 987 6543",
      checkInTime: "08:45 AM",
      photo: "SW",
    },
    {
      id: 3,
      name: "Mike Johnson",
      type: "Employee",
      floor: "Second Floor",
      block: "Block H",
      phone: "+27 84 555 1234",
      checkInTime: "09:00 AM",
      photo: "MJ",
    },
    {
      id: 4,
      name: "Emily Davis",
      type: "Employee",
      floor: "Ground Floor",
      block: "Block B",
      phone: "+27 81 777 8888",
      checkInTime: "08:15 AM",
      photo: "ED",
    },
    {
      id: 5,
      name: "David Brown",
      type: "Employee",
      floor: "First Floor",
      block: "Block E",
      phone: "+27 82 999 0000",
      checkInTime: "09:15 AM",
      photo: "DB",
    },
  ]);

  const filteredPeople = peopleInBuilding.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportRegister = () => {
    alert("Register exported to CSV");
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
            <h1 className="text-lg font-bold">Employee Check-In Register</h1>
            <p className="text-xs text-gray-400">Currently in Building 41</p>
          </div>
          <Button
            onClick={exportRegister}
            className="bg-blue-600 hover:bg-blue-700"
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
            placeholder="Search by name, floor, or block..."
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
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">{filteredPeople.length} People in Building</span>
          </div>
        </Card>

        {/* Register List */}
        <div className="space-y-3">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {person.photo}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{person.name}</h3>
                      <p className="text-gray-400 text-sm">{person.type}</p>
                    </div>
                    <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                      In Building
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Floor</p>
                      <p className="text-white font-medium">{person.floor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Block</p>
                      <p className="text-white font-medium">{person.block}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{person.phone}</span>
                      <span className="text-gray-500">In: {person.checkInTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPeople.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">No results found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
