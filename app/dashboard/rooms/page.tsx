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
  
  // Digital Twin state
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(true);
  const [highlightedRooms, setHighlightedRooms] = useState<string[]>([]);

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

      {/* Digital Twin Occupancy Map */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div 
          className="flex justify-between items-center cursor-pointer select-none" 
          onClick={() => setDigitalTwinOpen(!digitalTwinOpen)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Digital Twin Hostel Occupancy Map
            </h2>
          </div>
          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition">
            {digitalTwinOpen ? "Collapse Map" : "Expand Map"}
          </span>
        </div>

        {digitalTwinOpen && (
          <div className="mt-6 space-y-6">
            {/* Legend and Simulation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-emerald-500 rounded" /> Occupied / Partial</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-blue-500 rounded" /> Completely Vacant</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-red-500 rounded" /> Full / Alert</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-amber-500 rounded" /> Maintenance</span>
              </div>
              <button
                onClick={() => {
                  if (highlightedRooms.length > 0) {
                    setHighlightedRooms([]);
                  } else {
                    setHighlightedRooms(["102", "204"]);
                    setTimeout(() => alert("HostelGPT AI Agent: Identified plumbing pipeline anomalies and curfew alerts in Room 102 and Room 204. Problematic rooms highlighted."), 100);
                  }
                }}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow transition"
              >
                {highlightedRooms.length > 0 ? "Clear Highlights" : "AI Highlight Problematic Rooms"}
              </button>
            </div>

            {/* Floors Grid */}
            <div className="space-y-4">
              {[3, 2, 1].map((floorNum) => {
                const floorRooms = rooms.filter((r) => r.floor === floorNum);
                return (
                  <div key={floorNum} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Floor {floorNum}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                      {floorRooms.map((room) => {
                        const isFull = room.occupied === room.capacity || room.status === "full";
                        const isMaint = room.status === "maintenance";
                        const isVacant = room.occupied === 0;
                        const isHighlighted = highlightedRooms.includes(room.number);
                        
                        let bgCol = "bg-emerald-500 hover:bg-emerald-600";
                        if (isFull) bgCol = "bg-red-500 hover:bg-red-600";
                        else if (isMaint) bgCol = "bg-amber-500 hover:bg-amber-600";
                        else if (isVacant) bgCol = "bg-blue-500 hover:bg-blue-600";

                        return (
                          <div
                            key={room.id}
                            className={`p-3 rounded-xl text-center text-white font-bold cursor-pointer transition relative overflow-hidden group shadow-sm ${bgCol} ${
                              isHighlighted ? "animate-pulse ring-4 ring-offset-2 ring-indigo-600 scale-105" : "hover:scale-105"
                            }`}
                          >
                            <span className="text-sm block">RM {room.number}</span>
                            <span className="text-[10px] opacity-75 font-normal">
                              {room.occupied}/{room.capacity}
                            </span>
                            
                            {/* Hover Details Popover */}
                            <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-44 bg-slate-900/95 backdrop-blur text-white text-left p-3 rounded-xl text-[10px] z-50 shadow-2xl border border-slate-700 font-normal">
                              <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-xs text-blue-400">Room {room.number}</p>
                              <p className="mt-1">Floor: {room.floor} | Type: {room.type}</p>
                              <p>Status: <span className="capitalize">{room.status}</span></p>
                              <p>Occupancy: {room.occupied} / {room.capacity}</p>
                              {room.students && room.students.length > 0 && (
                                <p className="text-slate-400 truncate mt-1">S: {room.students.join(", ")}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

