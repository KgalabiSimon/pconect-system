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
  Plus,
  Edit,
  Trash2,
  Users,
  Wifi,
  Monitor,
  Coffee,
  Video,
  Projector,
  ChevronDown,
  ChevronUp,
  Layers,
  Grid3x3,
  X,
  AlertCircle,
  Building2
} from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useBuildings } from "@/hooks/api/useBuildings";
import { useSpaces } from "@/hooks/api/useSpaces";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { 
  BuildingResponse, 
  SpaceResponse, 
  SpaceCreate, 
  SpaceUpdate,
  FloorResponse,
  BlockResponse 
} from "@/types/api";

export default function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getBuildingById, isLoading: buildingLoading } = useBuildings();
  const { 
    spaces, 
    floors, 
    blocks, 
    isLoading: spacesLoading, 
    error, 
    loadBuildingSpaces, 
    createSpaces, 
    updateSpace, 
    deleteSpace, 
    loadBuildingFloors, 
    loadBuildingBlocks,
    clearError,
    isUpdating 
  } = useSpaces({ buildingId: id, initialLoad: true });

  const [building, setBuilding] = useState<BuildingResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"spaces" | "floors">("spaces");
  const [filterType, setFilterType] = useState("all");

  // Space modals
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { success, error: showError, ToastContainer } = useToast();

  const [spaceFormData, setSpaceFormData] = useState({
    type: "DESK" as "DESK" | "OFFICE" | "ROOM",
    quantity: 1,
  });

  useEffect(() => {
    if (isAuthenticated && id) {
      // Load building details
      getBuildingById(id).then(setBuilding);
      
      // Load building spaces, floors, and blocks
      loadBuildingSpaces(id);
      loadBuildingFloors(id);
      loadBuildingBlocks(id);
    }
  }, [isAuthenticated, id, getBuildingById, loadBuildingSpaces, loadBuildingFloors, loadBuildingBlocks]);

  const handleAddSpace = () => {
    setSpaceFormData({
      type: "DESK",
      quantity: 1,
    });
    setShowAddSpaceModal(true);
  };

  const handleSaveNewSpace = async () => {
    if (!id) return;

    setFormErrors({});
    clearError();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (spaceFormData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      showError("Please fix the validation errors");
      return;
    }

    try {
      const spaceData: SpaceCreate = {
        type: spaceFormData.type,
        quantity: spaceFormData.quantity,
      };

      const newSpaces = await createSpaces(id, [spaceData]);
      if (newSpaces && newSpaces.length > 0) {
        success("Space added successfully!");
        setShowAddSpaceModal(false);
        setSpaceFormData({ type: "DESK", quantity: 1 });
        setFormErrors({});
        loadBuildingSpaces(id); // Reload spaces
      } else {
        showError("Failed to add space. Please try again.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to add space. Please try again.";
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.details?.detail) {
        errorMessage = Array.isArray(err.details.detail)
          ? err.details.detail.map((e: any) => e.msg).join(", ")
          : err.details.detail;
      }
      showError(errorMessage);
    }
  };

  const handleEditSpace = (space: SpaceResponse) => {
    setSelectedSpace(space);
    setSpaceFormData({
      type: space.type,
      quantity: space.quantity,
    });
    setShowEditSpaceModal(true);
  };

  const handleSaveEditSpace = async () => {
    if (!selectedSpace) return;

    setFormErrors({});
    clearError();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (spaceFormData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      showError("Please fix the validation errors");
      return;
    }

    try {
      const updateData: SpaceUpdate = {
        quantity: spaceFormData.quantity,
      };

      const updatedSpace = await updateSpace(selectedSpace.id, updateData);
      if (updatedSpace) {
        success("Space updated successfully!");
        setShowEditSpaceModal(false);
        setSelectedSpace(null);
        setFormErrors({});
        loadBuildingSpaces(id!); // Reload spaces
      } else {
        showError("Failed to update space. Please try again.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to update space. Please try again.";
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.details?.detail) {
        errorMessage = Array.isArray(err.details.detail)
          ? err.details.detail.map((e: any) => e.msg).join(", ")
          : err.details.detail;
      }
      showError(errorMessage);
    }
  };

  const handleDeleteClick = (spaceId: string) => {
    setSpaceToDelete(spaceId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!spaceToDelete || !id) return;

    try {
      const deleted = await deleteSpace(spaceToDelete);
      if (deleted) {
        success("Space deleted successfully!");
        loadBuildingSpaces(id); // Reload spaces
      } else {
        showError("Failed to delete space. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete space. Please try again.";
      showError(errorMessage);
    } finally {
      setShowDeleteConfirm(false);
      setSpaceToDelete(null);
    }
  };

  const filteredSpaces = spaces.filter((space) => {
    if (filterType === "all") return true;
    return space.type.toLowerCase() === filterType.toLowerCase();
  });

  // Show loading state while checking authentication
  if (authLoading || buildingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Loading building details...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute>
      <ToastContainer />
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSpaceToDelete(null);
        }}
        title="Delete Space"
        message="Are you sure you want to delete this space? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
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
              <Link href="/admin/buildings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {building?.name || 'Building Details'}
                </h1>
                <p className="text-sm text-gray-600">{building?.address}</p>
              </div>
            </div>
            <Button onClick={handleAddSpace} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Add Space</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          {/* Building Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{building?.total_spaces || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Layers className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floors</p>
                  <p className="text-2xl font-bold text-gray-900">{building?.floors_count || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Grid3x3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blocks</p>
                  <p className="text-2xl font-bold text-gray-900">{building?.blocks_count || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab("spaces")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "spaces"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Spaces
            </button>
            <button
              onClick={() => setActiveTab("floors")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "floors"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Floors & Blocks
            </button>
          </div>

          {/* Spaces Tab */}
          {activeTab === "spaces" && (
            <div>
              {/* Filter */}
              <div className="mb-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="desk">Desks</SelectItem>
                    <SelectItem value="office">Offices</SelectItem>
                    <SelectItem value="room">Meeting Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Spaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpaces.map((space) => (
                  <Card key={space.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{building?.name || "Building"}</h3>
                          <p className="text-sm text-gray-600 capitalize">{space.type.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-green-600"
                          onClick={() => handleEditSpace(space)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => handleDeleteClick(space.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Quantity:</span>
                        <span>{space.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Building:</span>
                        <span className="truncate">{building?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(space.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredSpaces.length === 0 && !spacesLoading && (
                <Card className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No spaces found</h3>
                  <p className="text-gray-600 mb-4">
                    {filterType === "all" ? "Get started by adding your first space." : "Try adjusting your filter criteria."}
                  </p>
                  {filterType === "all" && (
                    <Button onClick={handleAddSpace} className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add Space
                    </Button>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Floors Tab */}
          {activeTab === "floors" && (
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Floors & Blocks</h3>
                <div className="space-y-4">
                  {floors.map((floor) => (
                    <div key={floor.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Floor {floor.floor_index}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {blocks.map((block) => (
                            <div key={block.id} className="bg-gray-50 rounded p-2 text-sm">
                              {block.block_label}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Add Space Modal */}
        {showAddSpaceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Space</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAddSpaceModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveNewSpace(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Space Type</label>
                  <Select
                    value={spaceFormData.type}
                    onValueChange={(value) => setSpaceFormData({ ...spaceFormData, type: value as "DESK" | "OFFICE" | "ROOM" })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESK">Desk</SelectItem>
                      <SelectItem value="OFFICE">Office</SelectItem>
                      <SelectItem value="ROOM">Meeting Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={spaceFormData.quantity}
                    onChange={(e) => {
                      setSpaceFormData({ ...spaceFormData, quantity: parseInt(e.target.value) || 1 });
                      setFormErrors({ ...formErrors, quantity: "" });
                    }}
                    className={`h-10 ${formErrors.quantity ? "border-red-500" : ""}`}
                    required
                  />
                  {formErrors.quantity && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={handleSaveNewSpace}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Adding..." : "Add Space"}
                  </Button>
                  <Button
                    onClick={() => setShowAddSpaceModal(false)}
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

        {/* Edit Space Modal */}
        {showEditSpaceModal && selectedSpace && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Space</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowEditSpaceModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditSpace(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Space Type</label>
                  <Select
                    value={spaceFormData.type}
                    onValueChange={(value) => setSpaceFormData({ ...spaceFormData, type: value as "DESK" | "OFFICE" | "ROOM" })}
                    disabled // Type cannot be changed
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESK">Desk</SelectItem>
                      <SelectItem value="OFFICE">Office</SelectItem>
                      <SelectItem value="ROOM">Meeting Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={spaceFormData.quantity}
                    onChange={(e) => {
                      setSpaceFormData({ ...spaceFormData, quantity: parseInt(e.target.value) || 1 });
                      setFormErrors({ ...formErrors, quantity: "" });
                    }}
                    className={`h-10 ${formErrors.quantity ? "border-red-500" : ""}`}
                    required
                  />
                  {formErrors.quantity && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.quantity}</p>
                  )}
                </div>
              </form>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditSpace}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditSpaceModal(false);
                    setSelectedSpace(null);
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