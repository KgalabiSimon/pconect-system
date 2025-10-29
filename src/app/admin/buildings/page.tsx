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
  Grid3x3,
  AlertCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useBuildings } from "@/hooks/api/useBuildings";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { BuildingResponse, BuildingCreate, BuildingUpdate } from "@/types/api";

export default function BuildingManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    buildings,
    isLoading,
    error,
    loadBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    clearError,
    isUpdating
  } = useBuildings({ initialLoad: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingResponse | null>(null);

  const [formData, setFormData] = useState({
    building_code: "",
    name: "",
    address: "",
    floors_count: 1,
  });

  useEffect(() => {
    // Load buildings when component mounts
    if (isAuthenticated) {
      loadBuildings();
    }
  }, [isAuthenticated, loadBuildings]);

  // Handle search
  useEffect(() => {
    const searchParams = {
      search: searchTerm || undefined,
    };

    if (searchTerm) {
      loadBuildings(searchParams);
    } else if (isAuthenticated) {
      loadBuildings();
    }
  }, [searchTerm, loadBuildings, isAuthenticated]);

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.building_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      if (confirm("Are you sure you want to delete this building?")) {
        const success = await deleteBuilding(buildingId);
        if (success) {
          alert("Building deleted successfully!");
        } else {
          alert("Failed to delete building. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error deleting building:", error);
      alert("Failed to delete building. Please try again.");
    }
  };

  const handleEditBuilding = (building: BuildingResponse) => {
    setSelectedBuilding(building);
    setFormData({
      building_code: building.building_code,
      name: building.name,
      address: building.address,
      floors_count: building.floors_count,
    });
    setShowEditModal(true);
  };

  const handleAddBuilding = () => {
    setFormData({
      building_code: "",
      name: "",
      address: "",
      floors_count: 1,
    });
    setShowAddModal(true);
  };

  const handleSaveNewBuilding = async () => {
    try {
      clearError();
      const newBuilding: BuildingCreate = {
        building_code: formData.building_code,
        name: formData.name,
        address: formData.address,
        floors_count: formData.floors_count,
      };
      const createdBuilding = await createBuilding(newBuilding);
      if (createdBuilding) {
        alert("Building added successfully!");
        setShowAddModal(false);
        loadBuildings(); // Reload buildings to show the new one
      } else {
        alert("Failed to add building. Please try again.");
      }
    } catch (error) {
      console.error("Add building error:", error);
      alert("Failed to add building. Please try again.");
    }
  };

  const handleSaveEditBuilding = async () => {
    try {
      clearError();
      if (!selectedBuilding) return;

      const updatedBuildingData: BuildingUpdate = {
        name: formData.name,
        address: formData.address,
        floors_count: formData.floors_count,
      };

      const updatedBuilding = await updateBuilding(selectedBuilding.id, updatedBuildingData);
      if (updatedBuilding) {
        alert("Building updated successfully!");
        setShowEditModal(false);
        loadBuildings(); // Reload buildings to show the updated one
      } else {
        alert("Failed to update building. Please try again.");
      }
    } catch (error) {
      console.error("Edit building error:", error);
      alert("Failed to update building. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Loading building management...</p>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
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
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Building Management</h1>
            </div>
            <Button onClick={handleAddBuilding} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Add Building</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          {/* Search */}
          <Card className="p-4 mb-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search buildings by name, address, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
              />
            </div>
          </Card>

          {/* Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              <Card key={building.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{building.name}</h3>
                      <p className="text-sm text-gray-600">{building.building_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/buildings/${building.id}`}>
                      <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
                        <Eye className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-green-600"
                      onClick={() => handleEditBuilding(building)}
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-red-600"
                      onClick={() => handleDeleteBuilding(building.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{building.address}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Layers className="w-4 h-4" />
                        <span className="font-semibold">{building.floors_count}</span>
                      </div>
                      <p className="text-xs text-gray-600">Floors</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Grid3x3 className="w-4 h-4" />
                        <span className="font-semibold">{building.blocks_count}</span>
                      </div>
                      <p className="text-xs text-gray-600">Blocks</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">{building.total_spaces}</span>
                      </div>
                      <p className="text-xs text-gray-600">Spaces</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(building.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredBuildings.length === 0 && !isLoading && (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No buildings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first building."}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddBuilding} className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Building
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Add Building Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Building</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveNewBuilding(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Code</label>
                  <Input
                    type="text"
                    value={formData.building_code}
                    onChange={(e) => setFormData({ ...formData, building_code: e.target.value })}
                    placeholder="BLD-001"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Building 41"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Innovation Drive, Pretoria"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.floors_count}
                    onChange={(e) => setFormData({ ...formData, floors_count: parseInt(e.target.value) })}
                    className="h-10"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={handleSaveNewBuilding}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Adding..." : "Add Building"}
                  </Button>
                  <Button
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit Building Modal */}
        {showEditModal && selectedBuilding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Building</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditBuilding(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Code</label>
                  <Input
                    type="text"
                    value={formData.building_code}
                    onChange={(e) => setFormData({ ...formData, building_code: e.target.value })}
                    placeholder="BLD-001"
                    className="h-10"
                    disabled // Building code cannot be changed
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Building 41"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Innovation Drive, Pretoria"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.floors_count}
                    onChange={(e) => setFormData({ ...formData, floors_count: parseInt(e.target.value) })}
                    className="h-10"
                    required
                  />
                </div>
              </form>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditBuilding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
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
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}