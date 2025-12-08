"use client";

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
import { useState } from "react";

export default function RoomsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllocationForm, setShowAllocationForm] = useState(false);

  const rooms = [
    {
      id: 1,
      number: "101",
      floor: 1,
      capacity: 2,
      occupied: 2,
      status: "full",
      type: "Double",
      students: ["Rahul Sharma (2021)", "Amit Kumar (2021)"],
    },
    {
      id: 2,
      number: "102",
      floor: 1,
      capacity: 2,
      occupied: 0,
      status: "available",
      type: "Double",
      students: [],
    },
    {
      id: 3,
      number: "103",
      floor: 1,
      capacity: 2,
      occupied: 2,
      status: "full",
      type: "Double",
      students: ["Priya Singh (2022)", "Sneha Patel (2022)"],
    },
    {
      id: 4,
      number: "201",
      floor: 2,
      capacity: 2,
      occupied: 1,
      status: "available",
      type: "Double",
      students: ["Vikram Reddy (2021)"],
    },
    {
      id: 5,
      number: "202",
      floor: 2,
      capacity: 2,
      occupied: 0,
      status: "available",
      type: "Double",
      students: [],
    },
  ];

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
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Room
          </motion.button>
        </div>
      </div>

      {/* Rooms Grid */}
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
                  px-3 py-1 rounded-full text-xs font-semibold
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
                <button className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No rooms found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
