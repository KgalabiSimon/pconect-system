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
  X
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

interface Floor {
  id: string;
  name: string;
  blocks: Block[];
}

interface Block {
  id: string;
  name: string;
  floorId: string;
}

interface Space {
  id: string;
  name: string;
  type: "desk" | "office" | "meeting_room";
  floor: string;
  block: string;
  capacity: number;
  amenities: string[];
  image: string;
  available: boolean;
  description: string;
}

export default function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Sample building data
  const building = {
    id: id,
    name: id === "BLD-001" ? "Building 41" : id === "BLD-002" ? "Building 42" : "DSTI Building",
    address: "123 Innovation Drive, Pretoria",
  };

  const [floors, setFloors] = useState<Floor[]>([
    {
      id: "FLR-001",
      name: "Ground Floor",
      blocks: [
        { id: "BLK-001", name: "Block A", floorId: "FLR-001" },
        { id: "BLK-002", name: "Block B", floorId: "FLR-001" },
        { id: "BLK-003", name: "Block C", floorId: "FLR-001" },
      ]
    },
    {
      id: "FLR-002",
      name: "First Floor",
      blocks: [
        { id: "BLK-004", name: "Block D", floorId: "FLR-002" },
        { id: "BLK-005", name: "Block E", floorId: "FLR-002" },
        { id: "BLK-006", name: "Block F", floorId: "FLR-002" },
      ]
    },
    {
      id: "FLR-003",
      name: "Second Floor",
      blocks: [
        { id: "BLK-007", name: "Block G", floorId: "FLR-003" },
        { id: "BLK-008", name: "Block H", floorId: "FLR-003" },
        { id: "BLK-009", name: "Block I", floorId: "FLR-003" },
      ]
    },
  ]);

  const [spaces, setSpaces] = useState<Space[]>([
    {
      id: "DSK-001",
      name: "Hot Desk 101",
      type: "desk",
      floor: "Ground Floor",
      block: "Block A",
      capacity: 1,
      amenities: ["WiFi", "Monitor", "Power Outlet"],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      available: true,
      description: "Modern hot desk with ergonomic chair and dual monitor setup"
    },
    {
      id: "OFF-001",
      name: "Private Office 201",
      type: "office",
      floor: "First Floor",
      block: "Block D",
      capacity: 4,
      amenities: ["WiFi", "Whiteboard", "Conference Phone", "Standing Desk"],
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
      available: true,
      description: "Spacious private office with natural lighting and city views"
    },
    {
      id: "MTG-001",
      name: "Meeting Room 3A",
      type: "meeting_room",
      floor: "Second Floor",
      block: "Block G",
      capacity: 10,
      amenities: ["WiFi", "Projector", "Whiteboard", "Video Conferencing", "Coffee Machine"],
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400",
      available: true,
      description: "Modern meeting room with state-of-the-art AV equipment"
    },
  ]);

  const [activeTab, setActiveTab] = useState<"floors" | "spaces">("floors");
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");

  // Floor/Block modals
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showEditFloorModal, setShowEditFloorModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  // Space modals
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const [floorFormData, setFloorFormData] = useState({ name: "" });
  const [blockFormData, setBlockFormData] = useState({ name: "", floorId: "" });

  const [spaceFormData, setSpaceFormData] = useState({
    name: "",
    type: "desk" as "desk" | "office" | "meeting_room",
    floor: "",
    block: "",
    capacity: 1,
    amenities: [] as string[],
    image: "",
    description: "",
  });

  const availableAmenities = [
    { id: "wifi", name: "WiFi", icon: Wifi },
    { id: "monitor", name: "Monitor", icon: Monitor },
    { id: "coffee", name: "Coffee Machine", icon: Coffee },
    { id: "video", name: "Video Conferencing", icon: Video },
    { id: "projector", name: "Projector", icon: Projector },
    { id: "whiteboard", name: "Whiteboard", icon: null },
    { id: "power", name: "Power Outlet", icon: null },
    { id: "standing_desk", name: "Standing Desk", icon: null },
    { id: "conference_phone", name: "Conference Phone", icon: null },
  ];

  const toggleFloorExpanded = (floorId: string) => {
    if (expandedFloors.includes(floorId)) {
      setExpandedFloors(expandedFloors.filter(id => id !== floorId));
    } else {
      setExpandedFloors([...expandedFloors, floorId]);
    }
  };

  // Floor Management
  const handleAddFloor = () => {
    setFloorFormData({ name: "" });
    setShowAddFloorModal(true);
  };

  const handleSaveNewFloor = () => {
    if (!floorFormData.name.trim()) {
      alert("Please enter a floor name");
      return;
    }

    const newFloor: Floor = {
      id: `FLR-${String(floors.length + 1).padStart(3, "0")}`,
      name: floorFormData.name,
      blocks: []
    };

    setFloors([...floors, newFloor]);
    setShowAddFloorModal(false);
    alert("Floor added successfully! Now add blocks to this floor.");
  };

  const handleEditFloor = (floor: Floor) => {
    setSelectedFloor(floor);
    setFloorFormData({ name: floor.name });
    setShowEditFloorModal(true);
  };

  const handleSaveEditFloor = () => {
    if (!selectedFloor || !floorFormData.name.trim()) {
      alert("Please enter a floor name");
      return;
    }

    const updatedFloors = floors.map(f =>
      f.id === selectedFloor.id ? { ...f, name: floorFormData.name } : f
    );

    setFloors(updatedFloors);
    setShowEditFloorModal(false);
    setSelectedFloor(null);
    alert("Floor updated successfully!");
  };

  const handleDeleteFloor = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (confirm(`Are you sure you want to delete "${floor?.name}"? This will also delete all blocks and spaces on this floor.`)) {
      setFloors(floors.filter(f => f.id !== floorId));
      // Also delete spaces on this floor
      setSpaces(spaces.filter(s => s.floor !== floor?.name));
      alert("Floor deleted successfully");
    }
  };

  // Block Management
  const handleAddBlock = (floor: Floor) => {
    setSelectedFloor(floor);
    setBlockFormData({ name: "", floorId: floor.id });
    setShowAddBlockModal(true);
  };

  const handleSaveNewBlock = () => {
    if (!blockFormData.name.trim() || !blockFormData.floorId) {
      alert("Please enter a block name");
      return;
    }

    const newBlock: Block = {
      id: `BLK-${String(floors.reduce((acc, f) => acc + f.blocks.length, 0) + 1).padStart(3, "0")}`,
      name: blockFormData.name,
      floorId: blockFormData.floorId
    };

    const updatedFloors = floors.map(f =>
      f.id === blockFormData.floorId
        ? { ...f, blocks: [...f.blocks, newBlock] }
        : f
    );

    setFloors(updatedFloors);
    setShowAddBlockModal(false);
    setSelectedFloor(null);
    alert("Block added successfully!");
  };

  const handleEditBlock = (block: Block, floor: Floor) => {
    setSelectedBlock(block);
    setSelectedFloor(floor);
    setBlockFormData({ name: block.name, floorId: block.floorId });
    setShowEditBlockModal(true);
  };

  const handleSaveEditBlock = () => {
    if (!selectedBlock || !blockFormData.name.trim()) {
      alert("Please enter a block name");
      return;
    }

    const updatedFloors = floors.map(f =>
      f.id === selectedBlock.floorId
        ? {
            ...f,
            blocks: f.blocks.map(b =>
              b.id === selectedBlock.id ? { ...b, name: blockFormData.name } : b
            )
          }
        : f
    );

    setFloors(updatedFloors);
    setShowEditBlockModal(false);
    setSelectedBlock(null);
    setSelectedFloor(null);
    alert("Block updated successfully!");
  };

  const handleDeleteBlock = (blockId: string, floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    const block = floor?.blocks.find(b => b.id === blockId);

    if (confirm(`Are you sure you want to delete "${block?.name}"? This will also delete all spaces in this block.`)) {
      const updatedFloors = floors.map(f =>
        f.id === floorId
          ? { ...f, blocks: f.blocks.filter(b => b.id !== blockId) }
          : f
      );
      setFloors(updatedFloors);

      // Delete spaces in this block
      setSpaces(spaces.filter(s => s.block !== block?.name));
      alert("Block deleted successfully");
    }
  };

  // Space Management (existing functions updated to use dynamic floors/blocks)
  const filteredSpaces = spaces.filter((space) => {
    if (filterType === "all") return true;
    return space.type === filterType;
  });

  const handleAddSpace = () => {
    setSpaceFormData({
      name: "",
      type: "desk",
      floor: "",
      block: "",
      capacity: 1,
      amenities: [],
      image: "",
      description: "",
    });
    setShowAddSpaceModal(true);
  };

  const handleEditSpace = (space: Space) => {
    setSelectedSpace(space);
    setSpaceFormData({
      name: space.name,
      type: space.type,
      floor: space.floor,
      block: space.block,
      capacity: space.capacity,
      amenities: space.amenities,
      image: space.image,
      description: space.description,
    });
    setShowEditSpaceModal(true);
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (confirm("Are you sure you want to delete this space?")) {
      setSpaces(spaces.filter((s) => s.id !== spaceId));
      alert("Space deleted successfully");
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (spaceFormData.amenities.includes(amenity)) {
      setSpaceFormData({
        ...spaceFormData,
        amenities: spaceFormData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setSpaceFormData({
        ...spaceFormData,
        amenities: [...spaceFormData.amenities, amenity],
      });
    }
  };

  const handleSaveNewSpace = () => {
    try {
      if (!spaceFormData.name || !spaceFormData.floor || !spaceFormData.block) {
        alert("Please fill in all required fields");
        return;
      }

      const prefix = spaceFormData.type === "desk" ? "DSK" : spaceFormData.type === "office" ? "OFF" : "MTG";
      const newSpace: Space = {
        id: `${prefix}-${String(spaces.filter(s => s.type === spaceFormData.type).length + 1).padStart(3, "0")}`,
        name: spaceFormData.name,
        type: spaceFormData.type,
        floor: spaceFormData.floor,
        block: spaceFormData.block,
        capacity: spaceFormData.capacity,
        amenities: spaceFormData.amenities,
        image: spaceFormData.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
        available: true,
        description: spaceFormData.description,
      };

      setSpaces([...spaces, newSpace]);
      setShowAddSpaceModal(false);
      alert("Space added successfully!");
    } catch (error) {
      console.error("Add space error:", error);
      alert("Failed to add space. Please try again.");
    }
  };

  const handleSaveEditSpace = () => {
    try {
      if (!selectedSpace) return;

      if (!spaceFormData.name || !spaceFormData.floor || !spaceFormData.block) {
        alert("Please fill in all required fields");
        return;
      }

      const updatedSpaces = spaces.map((s) =>
        s.id === selectedSpace.id
          ? {
              ...s,
              name: spaceFormData.name,
              type: spaceFormData.type,
              floor: spaceFormData.floor,
              block: spaceFormData.block,
              capacity: spaceFormData.capacity,
              amenities: spaceFormData.amenities,
              image: spaceFormData.image || s.image,
              description: spaceFormData.description,
            }
          : s
      );

      setSpaces(updatedSpaces);
      setShowEditSpaceModal(false);
      setSelectedSpace(null);
      alert("Space updated successfully!");
    } catch (error) {
      console.error("Edit space error:", error);
      alert("Failed to update space. Please try again.");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "desk":
        return "bg-green-100 text-green-700";
      case "office":
        return "bg-blue-100 text-blue-700";
      case "meeting_room":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "desk":
        return "Desk";
      case "office":
        return "Office";
      case "meeting_room":
        return "Meeting Room";
      default:
        return type;
    }
  };

  const stats = {
    totalFloors: floors.length,
    totalBlocks: floors.reduce((acc, f) => acc + f.blocks.length, 0),
    desks: spaces.filter((s) => s.type === "desk").length,
    offices: spaces.filter((s) => s.type === "office").length,
    meetingRooms: spaces.filter((s) => s.type === "meeting_room").length,
  };

  // Get available blocks for selected floor
  const getBlocksForFloor = (floorName: string) => {
    const floor = floors.find(f => f.name === floorName);
    return floor?.blocks || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-gray-900">{building.name}</h1>
              <p className="text-sm text-gray-600">{building.address}</p>
            </div>
          </div>
          <Button
            onClick={activeTab === "floors" ? handleAddFloor : handleAddSpace}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">
              {activeTab === "floors" ? "Add Floor" : "Add Space"}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="text-sm opacity-90">Floors</div>
            <div className="text-2xl font-bold">{stats.totalFloors}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-sm opacity-90">Blocks</div>
            <div className="text-2xl font-bold">{stats.totalBlocks}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90">Desks</div>
            <div className="text-2xl font-bold">{stats.desks}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90">Offices</div>
            <div className="text-2xl font-bold">{stats.offices}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90">Meeting Rooms</div>
            <div className="text-2xl font-bold">{stats.meetingRooms}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("floors")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "floors"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Floors & Blocks
          </button>
          <button
            onClick={() => setActiveTab("spaces")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "spaces"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-2" />
            Spaces
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "floors" ? (
          // Floors & Blocks View
          <div className="space-y-4">
            {floors.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No floors yet. Add your first floor!</p>
                <Button onClick={handleAddFloor} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Floor
                </Button>
              </div>
            ) : (
              floors.map((floor) => (
                <Card key={floor.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleFloorExpanded(floor.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedFloors.includes(floor.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <Layers className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold">{floor.name}</h3>
                        <p className="text-sm text-gray-600">
                          {floor.blocks.length} block{floor.blocks.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddBlock(floor)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Block
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFloor(floor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFloor(floor.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Blocks */}
                  {expandedFloors.includes(floor.id) && (
                    <div className="mt-4 pl-8 space-y-2">
                      {floor.blocks.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No blocks yet. Click "Add Block" to add one.
                        </p>
                      ) : (
                        floor.blocks.map((block) => (
                          <div
                            key={block.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Grid3x3 className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">{block.name}</span>
                              <span className="text-xs text-gray-500">({block.id})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditBlock(block, floor)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBlock(block.id, floor.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        ) : (
          // Spaces View (existing)
          <>
            <div className="mb-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 max-w-xs">
                  <SelectValue placeholder="All Space Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Space Types</SelectItem>
                  <SelectItem value="desk">Desks Only</SelectItem>
                  <SelectItem value="office">Offices Only</SelectItem>
                  <SelectItem value="meeting_room">Meeting Rooms Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredSpaces.map((space) => (
                <Card key={space.id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{space.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${getTypeColor(space.type)}`}>
                              {getTypeLabel(space.type)}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {space.id}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{space.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <div className="text-gray-600 text-xs">Floor</div>
                          <div className="font-medium">{space.floor}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Block</div>
                          <div className="font-medium">{space.block}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Capacity</div>
                          <div className="font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {space.capacity} {space.capacity === 1 ? "person" : "people"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Status</div>
                          <div className={`font-medium ${space.available ? "text-green-600" : "text-red-600"}`}>
                            {space.available ? "Available" : "Occupied"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {space.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSpace(space)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSpace(space.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredSpaces.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No spaces found. Add your first space!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Floor Modal */}
      {showAddFloorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add New Floor</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Floor Name *
                  </label>
                  <Input
                    value={floorFormData.name}
                    onChange={(e) => setFloorFormData({ name: e.target.value })}
                    placeholder="e.g., Ground Floor, 1st Floor, Basement"
                    className="h-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a custom name for this floor
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 After creating the floor, you can add blocks to it (e.g., Block A, Block B, etc.)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveNewFloor}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Floor
                </Button>
                <Button
                  onClick={() => setShowAddFloorModal(false)}
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

      {/* Edit Floor Modal */}
      {showEditFloorModal && selectedFloor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Floor</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Floor Name *
                  </label>
                  <Input
                    value={floorFormData.name}
                    onChange={(e) => setFloorFormData({ name: e.target.value })}
                    placeholder="e.g., Ground Floor"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditFloor}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowEditFloorModal(false);
                    setSelectedFloor(null);
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

      {/* Add Block Modal */}
      {showAddBlockModal && selectedFloor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Add Block</h2>
              <p className="text-sm text-gray-600 mb-6">
                Adding block to: <span className="font-semibold">{selectedFloor.name}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Block Name *
                  </label>
                  <Input
                    value={blockFormData.name}
                    onChange={(e) => setBlockFormData({ ...blockFormData, name: e.target.value })}
                    placeholder="e.g., Block A, North Wing, Section 1"
                    className="h-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a custom name for this block
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveNewBlock}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Block
                </Button>
                <Button
                  onClick={() => {
                    setShowAddBlockModal(false);
                    setSelectedFloor(null);
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

      {/* Edit Block Modal */}
      {showEditBlockModal && selectedBlock && selectedFloor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Edit Block</h2>
              <p className="text-sm text-gray-600 mb-6">
                Floor: <span className="font-semibold">{selectedFloor.name}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Block Name *
                  </label>
                  <Input
                    value={blockFormData.name}
                    onChange={(e) => setBlockFormData({ ...blockFormData, name: e.target.value })}
                    placeholder="e.g., Block A"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditBlock}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowEditBlockModal(false);
                    setSelectedBlock(null);
                    setSelectedFloor(null);
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

      {/* Add Space Modal - Updated to use dynamic floors/blocks */}
      {showAddSpaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="bg-white w-full max-w-3xl my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add New Space</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Space Name *
                    </label>
                    <Input
                      value={spaceFormData.name}
                      onChange={(e) => setSpaceFormData({ ...spaceFormData, name: e.target.value })}
                      placeholder="e.g., Hot Desk 101"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Space Type *
                    </label>
                    <Select
                      value={spaceFormData.type}
                      onValueChange={(value: "desk" | "office" | "meeting_room") =>
                        setSpaceFormData({ ...spaceFormData, type: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desk">Desk</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="meeting_room">Meeting Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Floor *
                    </label>
                    <Select
                      value={spaceFormData.floor}
                      onValueChange={(value) => setSpaceFormData({ ...spaceFormData, floor: value, block: "" })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors.map((floor) => (
                          <SelectItem key={floor.id} value={floor.name}>
                            {floor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Block *
                    </label>
                    <Select
                      value={spaceFormData.block}
                      onValueChange={(value) => setSpaceFormData({ ...spaceFormData, block: value })}
                      disabled={!spaceFormData.floor}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBlocksForFloor(spaceFormData.floor).map((block) => (
                          <SelectItem key={block.id} value={block.name}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Capacity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={spaceFormData.capacity}
                      onChange={(e) =>
                        setSpaceFormData({ ...spaceFormData, capacity: parseInt(e.target.value) || 1 })
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Input
                    value={spaceFormData.description}
                    onChange={(e) => setSpaceFormData({ ...spaceFormData, description: e.target.value })}
                    placeholder="Brief description of the space"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Image URL (Optional)
                  </label>
                  <Input
                    value={spaceFormData.image}
                    onChange={(e) => setSpaceFormData({ ...spaceFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          spaceFormData.amenities.includes(amenity.name)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {amenity.icon && <amenity.icon className="w-4 h-4" />}
                        <span className="text-sm">{amenity.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveNewSpace}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Space
                </Button>
                <Button
                  onClick={() => setShowAddSpaceModal(false)}
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

      {/* Edit Space Modal - Similar updates */}
      {showEditSpaceModal && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="bg-white w-full max-w-3xl my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Space</h2>
                <span className="text-sm text-gray-600">{selectedSpace.id}</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Space Name *
                    </label>
                    <Input
                      value={spaceFormData.name}
                      onChange={(e) => setSpaceFormData({ ...spaceFormData, name: e.target.value })}
                      placeholder="e.g., Hot Desk 101"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Space Type *
                    </label>
                    <Select
                      value={spaceFormData.type}
                      onValueChange={(value: "desk" | "office" | "meeting_room") =>
                        setSpaceFormData({ ...spaceFormData, type: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desk">Desk</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="meeting_room">Meeting Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Floor *
                    </label>
                    <Select
                      value={spaceFormData.floor}
                      onValueChange={(value) => setSpaceFormData({ ...spaceFormData, floor: value, block: "" })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors.map((floor) => (
                          <SelectItem key={floor.id} value={floor.name}>
                            {floor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Block *
                    </label>
                    <Select
                      value={spaceFormData.block}
                      onValueChange={(value) => setSpaceFormData({ ...spaceFormData, block: value })}
                      disabled={!spaceFormData.floor}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBlocksForFloor(spaceFormData.floor).map((block) => (
                          <SelectItem key={block.id} value={block.name}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Capacity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={spaceFormData.capacity}
                      onChange={(e) =>
                        setSpaceFormData({ ...spaceFormData, capacity: parseInt(e.target.value) || 1 })
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Input
                    value={spaceFormData.description}
                    onChange={(e) => setSpaceFormData({ ...spaceFormData, description: e.target.value })}
                    placeholder="Brief description of the space"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Image URL
                  </label>
                  <Input
                    value={spaceFormData.image}
                    onChange={(e) => setSpaceFormData({ ...spaceFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          spaceFormData.amenities.includes(amenity.name)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {amenity.icon && <amenity.icon className="w-4 h-4" />}
                        <span className="text-sm">{amenity.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleSaveEditSpace}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
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
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
