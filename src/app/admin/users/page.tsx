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
  Eye,
  Filter,
  Download,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/api/useAuth";
import { useUsers } from "@/hooks/api/useUsers";
import { useBuildingSelection } from "@/hooks/api/useBuildingSelection";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { UserResponse } from "@/types/api";

// Using UserResponse from API types instead of local interface

export default function UserManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { buildingOptions, isLoading: buildingsLoading } = useBuildingSelection();
  const {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserCount,
    clearError,
    isUpdating
  } = useUsers({ initialLoad: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    building: "",
    programme: "",
    floor: "",
    block: "",
    laptop: "",
    assetNumber: "",
  });

  useEffect(() => {
    // Load users when component mounts
    if (isAuthenticated) {
      loadUsers();
      getUserCount();
    }
  }, [isAuthenticated, loadUsers, getUserCount]);

  // Handle search and filtering
  useEffect(() => {
    const searchParams = {
      search: searchTerm || undefined,
      building_id: filterBuilding || undefined,
      programme_id: filterProgramme || undefined,
    };

    // Only search if we have search criteria or filters
    if (searchTerm || filterBuilding || filterProgramme) {
      loadUsers(searchParams);
    } else if (isAuthenticated) {
      // Load all users if no filters
      loadUsers();
    }
  }, [searchTerm, filterBuilding, filterProgramme, loadUsers, isAuthenticated]);

  // Since we're using Azure API, filtering is done server-side
  // We can still do client-side filtering for additional UI features
  const filteredUsers = users.filter((user) => {
    const matchesFloor = !filterFloor || filterFloor === "all" || user.floor_id === filterFloor;
    const matchesBlock = !filterBlock || filterBlock === "all" || user.block_id === filterBlock;
    
    return matchesFloor && matchesBlock;
  });

  const handleDeleteUser = async (userId: string) => {
    try {
      if (confirm("Are you sure you want to delete this user?")) {
        const success = await deleteUser(userId);
        if (success) {
          alert("User deleted successfully!");
        } else {
          alert("Failed to delete user. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      building: user.building_id || "",
      programme: user.programme || "",
      floor: user.floor_id || "",
      block: user.block_id || "",
      laptop: user.laptop_model || "",
      assetNumber: user.laptop_asset_number || "",
    });
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      building: "",
      programme: "",
      floor: "",
      block: "",
      laptop: "",
      assetNumber: "",
    });
    setShowAddModal(true);
  };

  const handleSaveNewUser = () => {
    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        alert("Please fill in all required fields");
        return;
      }

      const newUser: User = {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        building: formData.building,
        programme: formData.programme,
        floor: formData.floor,
        block: formData.block,
        laptop: formData.laptop,
        assetNumber: formData.assetNumber,
        createdAt: new Date().toISOString().split("T")[0],
        totalCheckIns: 0,
      };

      setUsers([...users, newUser]);
      setShowAddModal(false);
      alert("User added successfully!");
    } catch (error) {
      console.error("Add user error:", error);
      alert("Failed to add user. Please try again.");
    }
  };

  const handleSaveEditUser = () => {
    try {
      if (!selectedUser) return;

      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        alert("Please fill in all required fields");
        return;
      }

      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              building: formData.building,
              programme: formData.programme,
              floor: formData.floor,
              block: formData.block,
              laptop: formData.laptop,
              assetNumber: formData.assetNumber,
            }
          : u
      );

      setUsers(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Edit user error:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const exportUsers = () => {
    try {
      const csv = [
        ["ID", "First Name", "Last Name", "Email", "Phone", "Building", "Floor", "Block", "Programme", "Laptop", "Asset Number", "Check-Ins", "Created"],
        ...filteredUsers.map((u) => [
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.phone,
          u.building,
          u.floor || "",
          u.block || "",
          u.programme,
          u.laptop,
          u.assetNumber,
          u.totalCheckIns.toString(),
          u.createdAt
        ])
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert(`Successfully exported ${filteredUsers.length} users to CSV!`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export users. Please try again.");
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

  // Show loading only if not an error (error state should show message instead)
  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Loading user management...</p>
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
          <div className="bg-red-50 border-l-4 border-red-500 px-6 py-4 mx-auto max-w-7xl mt-4">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-base">{error}</p>
                {error.includes('permission') && (
                  <p className="text-sm text-red-700 mt-1">
                    Your account does not have access to this feature. If you believe this is an error, please contact your system administrator.
                  </p>
                )}
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 p-1 rounded"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600">{filteredUsers.length} users found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportUsers}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export CSV</span>
            </Button>
            <Button
              onClick={handleAddUser}
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add User</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Building Filter */}
            <Select value={filterBuilding} onValueChange={setFilterBuilding}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildingsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading buildings...
                  </SelectItem>
                ) : (
                  buildingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Floor Filter */}
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                <SelectItem value="First Floor">First Floor</SelectItem>
                <SelectItem value="Second Floor">Second Floor</SelectItem>
                <SelectItem value="Third Floor">Third Floor</SelectItem>
              </SelectContent>
            </Select>

            {/* Block Filter */}
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
                <SelectItem value="Block E">Block E</SelectItem>
                <SelectItem value="Block F">Block F</SelectItem>
              </SelectContent>
            </Select>

            {/* Programme Filter */}
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

          {/* Active Filters */}
          {((filterBuilding && filterBuilding !== "all") ||
            (filterFloor && filterFloor !== "all") ||
            (filterBlock && filterBlock !== "all") ||
            (filterProgramme && filterProgramme !== "all")) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filterBuilding && filterBuilding !== "all" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                  {filterBuilding}
                  <button onClick={() => setFilterBuilding("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterFloor && filterFloor !== "all" && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                  {filterFloor}
                  <button onClick={() => setFilterFloor("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterBlock && filterBlock !== "all" && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1">
                  {filterBlock}
                  <button onClick={() => setFilterBlock("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterProgramme && filterProgramme !== "all" && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                  {filterProgramme}
                  <button onClick={() => setFilterProgramme("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Building
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Programme
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Check-Ins
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{user.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{user.email}</div>
                        <div className="text-gray-600">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{user.building_id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{user.programme}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {user.check_in_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button size="sm" variant="ghost" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="John"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john.doe@example.com"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+27 82 123 4567"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Building
                  </label>
                  <Select
                    value={formData.building}
                    onValueChange={(value) =>
                      setFormData({ ...formData, building: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading buildings...
                        </SelectItem>
                      ) : (
                        buildingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Programme / Department
                  </label>
                  <Select
                    value={formData.programme}
                    onValueChange={(value) =>
                      setFormData({ ...formData, programme: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programme 1A">Programme 1A</SelectItem>
                      <SelectItem value="Programme 1B">Programme 1B</SelectItem>
                      <SelectItem value="Programme 2">Programme 2</SelectItem>
                      <SelectItem value="Programme 3">Programme 3</SelectItem>
                      <SelectItem value="Programme 4">Programme 4</SelectItem>
                      <SelectItem value="Programme 5">Programme 5</SelectItem>
                      <SelectItem value="Programme 6">Programme 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Floor
                    </label>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, floor: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                        <SelectItem value="First Floor">First Floor</SelectItem>
                        <SelectItem value="Second Floor">Second Floor</SelectItem>
                        <SelectItem value="Third Floor">Third Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Block
                    </label>
                    <Select
                      value={formData.block}
                      onValueChange={(value) =>
                        setFormData({ ...formData, block: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Block A">Block A</SelectItem>
                        <SelectItem value="Block B">Block B</SelectItem>
                        <SelectItem value="Block C">Block C</SelectItem>
                        <SelectItem value="Block D">Block D</SelectItem>
                        <SelectItem value="Block E">Block E</SelectItem>
                        <SelectItem value="Block F">Block F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Laptop Model
                  </label>
                  <Input
                    value={formData.laptop}
                    onChange={(e) =>
                      setFormData({ ...formData, laptop: e.target.value })
                    }
                    placeholder="Dell Latitude 5420"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Asset Number
                  </label>
                  <Input
                    value={formData.assetNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, assetNumber: e.target.value })
                    }
                    placeholder="DST-001"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveNewUser}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  Add User
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

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Edit User</h2>
                  <p className="text-sm text-gray-600">{selectedUser.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="John"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john.doe@example.com"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+27 82 123 4567"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Building
                  </label>
                  <Select
                    value={formData.building}
                    onValueChange={(value) =>
                      setFormData({ ...formData, building: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading buildings...
                        </SelectItem>
                      ) : (
                        buildingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Programme / Department
                  </label>
                  <Select
                    value={formData.programme}
                    onValueChange={(value) =>
                      setFormData({ ...formData, programme: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programme 1A">Programme 1A</SelectItem>
                      <SelectItem value="Programme 1B">Programme 1B</SelectItem>
                      <SelectItem value="Programme 2">Programme 2</SelectItem>
                      <SelectItem value="Programme 3">Programme 3</SelectItem>
                      <SelectItem value="Programme 4">Programme 4</SelectItem>
                      <SelectItem value="Programme 5">Programme 5</SelectItem>
                      <SelectItem value="Programme 6">Programme 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Floor
                    </label>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, floor: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                        <SelectItem value="First Floor">First Floor</SelectItem>
                        <SelectItem value="Second Floor">Second Floor</SelectItem>
                        <SelectItem value="Third Floor">Third Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Block
                    </label>
                    <Select
                      value={formData.block}
                      onValueChange={(value) =>
                        setFormData({ ...formData, block: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Block A">Block A</SelectItem>
                        <SelectItem value="Block B">Block B</SelectItem>
                        <SelectItem value="Block C">Block C</SelectItem>
                        <SelectItem value="Block D">Block D</SelectItem>
                        <SelectItem value="Block E">Block E</SelectItem>
                        <SelectItem value="Block F">Block F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Laptop Model
                  </label>
                  <Input
                    value={formData.laptop}
                    onChange={(e) =>
                      setFormData({ ...formData, laptop: e.target.value })
                    }
                    placeholder="Dell Latitude 5420"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Asset Number
                  </label>
                  <Input
                    value={formData.assetNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, assetNumber: e.target.value })
                    }
                    placeholder="DST-001"
                    className="h-10"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium">{selectedUser.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Check-Ins:</span>
                      <span className="font-medium">{selectedUser.totalCheckIns}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditUser}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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
    </ProtectedRoute>
  );
}
