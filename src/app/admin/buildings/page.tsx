"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Layers,
  Grid3x3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Building {
  id: string;
  name: string;
  address: string;
  totalFloors: number;
  totalBlocks: number;
  totalSpaces: number;
  desks: number;
  offices: number;
  meetingRooms: number;
  createdAt: string;
}

export default function BuildingManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: "BLD-001",
      name: "Building 41",
      address: "123 Innovation Drive, Pretoria",
      totalFloors: 3,
      totalBlocks: 9,
      totalSpaces: 45,
      desks: 25,
      offices: 10,
      meetingRooms: 10,
      createdAt: "2025-01-15"
    },
    {
      id: "BLD-002",
      name: "Building 42",
      address: "456 Science Avenue, Pretoria",
      totalFloors: 3,
      totalBlocks: 9,
      totalSpaces: 38,
      desks: 20,
      offices: 8,
      meetingRooms: 10,
      createdAt: "2025-01-20"
    },
    {
      id: "BLD-003",
      name: "DSTI Building",
      address: "789 Technology Street, Pretoria",
      totalFloors: 4,
      totalBlocks: 12,
      totalSpaces: 52,
      desks: 30,
      offices: 12,
      meetingRooms: 10,
      createdAt: "2025-02-01"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    totalFloors: 1,
    totalBlocks: 1,
  });

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

  const filteredBuildings = buildings.filter((building) => {
    const matchesSearch =
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm("Are you sure you want to delete this building? This will also delete all associated spaces.")) {
      setBuildings(buildings.filter((b) => b.id !== buildingId));
      alert("Building deleted successfully");
    }
  };

  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setFormData({
      name: building.name,
      address: building.address,
      totalFloors: building.totalFloors,
      totalBlocks: building.totalBlocks,
    });
    setShowEditModal(true);
  };

  const handleAddBuilding = () => {
    setFormData({
      name: "",
      address: "",
      totalFloors: 1,
      totalBlocks: 1,
    });
    setShowAddModal(true);
  };

  const handleSaveNewBuilding = () => {
    try {
      if (!formData.name || !formData.address) {
        alert("Please fill in all required fields");
        return;
      }

      const newBuilding: Building = {
        id: `BLD-${String(buildings.length + 1).padStart(3, "0")}`,
        name: formData.name,
        address: formData.address,
        totalFloors: formData.totalFloors,
        totalBlocks: formData.totalBlocks,
        totalSpaces: 0,
        desks: 0,
        offices: 0,
        meetingRooms: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setBuildings([...buildings, newBuilding]);
      setShowAddModal(false);
      alert("Building added successfully! Now add spaces to this building.");
      router.push(`/admin/buildings/${newBuilding.id}`);
    } catch (error) {
      console.error("Add building error:", error);
      alert("Failed to add building. Please try again.");
    }
  };

  const handleSaveEditBuilding = () => {
    try {
      if (!selectedBuilding) return;

      if (!formData.name || !formData.address) {
        alert("Please fill in all required fields");
        return;
      }

      const updatedBuildings = buildings.map((b) =>
        b.id === selectedBuilding.id
          ? {
              ...b,
              name: formData.name,
              address: formData.address,
              totalFloors: formData.totalFloors,
              totalBlocks: formData.totalBlocks,
            }
          : b
      );

      setBuildings(updatedBuildings);
      setShowEditModal(false);
      setSelectedBuilding(null);
      alert("Building updated successfully!");
    } catch (error) {
      console.error("Edit building error:", error);
      alert("Failed to update building. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading building management...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Building Management</h1>
              <p className="text-sm text-gray-600">{filteredBuildings.length} buildings</p>
            </div>
          </div>
          <Button
            onClick={handleAddBuilding}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Building</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => (
            <Card key={building.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{building.name}</h3>
                    <p className="text-xs text-gray-600">{building.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{building.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Layers className="w-4 h-4" />
                  <span>{building.totalFloors} Floors • {building.totalBlocks} Blocks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Grid3x3 className="w-4 h-4" />
                  <span>{building.totalSpaces} Total Spaces</span>
                </div>
              </div>

              {/* Space Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="text-xl font-bold text-green-700">{building.desks}</div>
                  <div className="text-xs text-gray-600">Desks</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-xl font-bold text-blue-700">{building.offices}</div>
                  <div className="text-xs text-gray-600">Offices</div>
                </div>
                <div className="bg-purple-50 p-2 rounded text-center">
                  <div className="text-xl font-bold text-purple-700">{building.meetingRooms}</div>
                  <div className="text-xs text-gray-600">Rooms</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/admin/buildings/${building.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Manage Spaces
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditBuilding(building)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteBuilding(building.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredBuildings.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No buildings found</p>
          </div>
        )}
      </div>

      {/* Add Building Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add New Building</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Building Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Building 41"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Innovation Drive, Pretoria"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Floors
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalFloors}
                      onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 1 })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Blocks
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalBlocks}
                      onChange={(e) => setFormData({ ...formData, totalBlocks: parseInt(e.target.value) || 1 })}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ After creating the building, you'll be able to add desks, offices, and meeting rooms to it.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveNewBuilding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Building
                </Button>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Building Modal */}
      {showEditModal && selectedBuilding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Building</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Building Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Building 41"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Innovation Drive, Pretoria"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Floors
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalFloors}
                      onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 1 })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Blocks
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalBlocks}
                      onChange={(e) => setFormData({ ...formData, totalBlocks: parseInt(e.target.value) || 1 })}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-900">
                    ⚠️ Changing floors or blocks won't affect existing spaces. You can manage spaces separately.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditBuilding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBuilding(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
