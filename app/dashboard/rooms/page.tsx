"use client";

import { Button, Input, Modal } from "@/components";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle,
  Edit,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type Room = {
  id: string;
  number: string;
  floor: number;
  capacity: number;
  occupied: number;
  status: "available" | "full" | "maintenance";
  type: string;
  students: string[];
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newNumber, setNewNumber] = useState("");
  const [newFloor, setNewFloor] = useState("1");
  const [newCapacity, setNewCapacity] = useState("2");
  const [newType, setNewType] = useState("Double");
  const [newStatus, setNewStatus] = useState("available");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms || []);
      }
    } catch {
      console.error("Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRooms();
  }, []);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: newNumber,
          floor: parseInt(newFloor),
          capacity: parseInt(newCapacity),
          type: newType,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create room.");
      } else {
        setShowAddModal(false);
        setNewNumber("");
        setNewFloor("1");
        setNewCapacity("2");
        setNewType("Double");
        setNewStatus("available");
        await fetchRooms();
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const res = await fetch(`/api/rooms?id=${roomId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete room.");
      }
    } catch {
      alert("Failed to delete room.");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesFilter = filter === "all" || room.status === filter;
    const matchesSearch =
      room.number.includes(searchQuery) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    full: rooms.filter((r) => r.status === "full").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Room Management
        </h1>
        <p className="text-gray-600">Manage hostel rooms and occupancy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Building2 className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.available}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Fully Occupied</p>
              <p className="text-3xl font-bold text-gray-800">{stats.full}</p>
            </div>
            <Users className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Maintenance</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.maintenance}
              </p>
            </div>
            <XCircle className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room number or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "available", "full", "maintenance"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${
                    filter === status
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Room
          </motion.button>
        </div>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading rooms database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className={`h-2 ${
                  room.status === "available"
                    ? "bg-green-500"
                    : room.status === "full"
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}
              />

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      Room {room.number}
                    </h3>
                  </div>
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-semibold uppercase
                    ${
                      room.status === "available"
                        ? "bg-green-100 text-green-700"
                        : room.status === "full"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-800">
                      {room.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-semibold text-gray-800">
                      {room.floor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="font-semibold text-gray-800">
                      {room.occupied}/{room.capacity}
                    </span>
                  </div>
                  {room.students && room.students.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                      <span className="font-medium">Students: </span>
                      {room.students.join(", ")}
                    </div>
                  )}
                </div>

                {/* Occupancy Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        room.occupied === room.capacity
                          ? "bg-red-500"
                          : room.occupied > room.capacity / 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${(room.occupied / room.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredRooms.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No rooms found matching your criteria
          </p>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Room"
        >
          <form onSubmit={handleAddRoom} className="space-y-4">
            <Input
              label="Room Number"
              type="text"
              placeholder="e.g. 101"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              required
            />
            <Input
              label="Floor"
              type="number"
              placeholder="e.g. 1"
              value={newFloor}
              onChange={(e) => setNewFloor(e.target.value)}
              required
            />
            <Input
              label="Capacity"
              type="number"
              placeholder="e.g. 2"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Room"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

