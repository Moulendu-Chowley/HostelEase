"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Home, Users, CheckCircle, DoorOpen } from "lucide-react";
import { 
  StatCard, 
  RoomCard,
  Button,
  Modal,
  PageContainer
} from "@/components";

export default function RoomAllotmentPage() {
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [filter, setFilter] = useState("all");

  // Mock room data (2 students per room)
  const rooms = [
    {
      id: 1,
      number: "101",
      floor: 1,
      capacity: 2,
      students: ["Rahul Sharma", "Amit Kumar"],
      year: "3rd Year",
      status: "full" as const,
    },
    {
      id: 2,
      number: "102",
      floor: 1,
      capacity: 2,
      students: ["Priya Singh", "Sneha Patel"],
      year: "2nd Year",
      status: "full" as const,
    },
    {
      id: 3,
      number: "103",
      floor: 1,
      capacity: 2,
      students: ["Vikram Reddy"],
      year: "3rd Year",
      status: "available" as const,
    },
    {
      id: 4,
      number: "104",
      floor: 1,
      capacity: 2,
      students: [],
      year: "-",
      status: "available" as const,
    },
    {
      id: 5,
      number: "201",
      floor: 2,
      capacity: 2,
      students: ["Rohan Verma", "Arjun Nair"],
      year: "2nd Year",
      status: "full" as const,
    },
    {
      id: 6,
      number: "202",
      floor: 2,
      capacity: 2,
      students: ["Kavya Iyer", "Ananya Das"],
      year: "1st Year",
      status: "full" as const,
    },
    {
      id: 7,
      number: "203",
      floor: 2,
      capacity: 2,
      students: ["Divya Menon"],
      year: "1st Year",
      status: "available" as const,
    },
    {
      id: 8,
      number: "204",
      floor: 2,
      capacity: 2,
      students: [],
      year: "-",
      status: "available" as const,
    },
  ];

  const stats = {
    total: 120,
    occupied: 98,
    available: 22,
    pending: 15,
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === "all") return true;
    if (filter === "full") return room.status === "full";
    if (filter === "available") return room.status === "available";
    if (filter === "partial") return room.students.length === 1;
    return true;
  });

  return (
    <PageContainer gradient="from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🏠 Room Allotment System
            </h1>
            <p className="text-gray-600">
              AI-powered allocation: 2 students per room, same year preference
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAllocationModal(true)}
          >
            🤖 Auto Allocate
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Rooms"
            value={stats.total}
            icon={Home}
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Occupied"
            value={stats.occupied}
            icon={Users}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            title="Available"
            value={stats.available}
            icon={DoorOpen}
            gradient="from-orange-400 to-orange-600"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pending}
            icon={CheckCircle}
            gradient="from-purple-400 to-purple-600"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          {["all", "full", "available", "partial"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all capitalize ${
                filter === filterOption
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Room Grid - Using RoomCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <RoomCard 
                room={room}
                onAllocate={() => console.log("Allocate to", room.number)}
                onViewDetails={() => console.log("View details for", room.number)}
              />
            </motion.div>
          ))}
        </div>

        {/* Auto Allocation Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            AI Allocation Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Same Year Preference
                </h3>
                <p className="text-gray-600 text-sm">
                  Algorithm prioritizes matching students from the same academic
                  year for better compatibility
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  2 Students Per Room
                </h3>
                <p className="text-gray-600 text-sm">
                  Fixed capacity ensures optimal space utilization and maintains
                  privacy standards
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Smart Matching
                </h3>
                <p className="text-gray-600 text-sm">
                  AI considers preferences, behavior patterns, and compatibility
                  scores for optimal pairing
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DoorOpen className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Manual Override
                </h3>
                <p className="text-gray-600 text-sm">
                  Administrators can manually adjust allocations based on special
                  requirements
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auto Allocation Modal */}
      {showAllocationModal && (
        <Modal
          isOpen={showAllocationModal}
          onClose={() => setShowAllocationModal(false)}
          title="Auto Room Allocation"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This will automatically allocate all pending students to available
              rooms based on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Same academic year preference</li>
              <li>2 students per room capacity</li>
              <li>Student compatibility scores</li>
              <li>Floor and wing preferences</li>
            </ul>
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  // Allocation logic here
                  setShowAllocationModal(false);
                  alert("Auto-allocation initiated! Processing 15 pending requests...");
                }}
              >
                Start Allocation
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAllocationModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
