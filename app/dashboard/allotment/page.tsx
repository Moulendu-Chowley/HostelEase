"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAllocating, setIsAllocating] = useState(false);

  const fetchAllotments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/allotment");
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms || []);
        setStats(data.stats || { total: 0, occupied: 0, available: 0, pending: 0 });
      }
    } catch (e) {
      console.error("Failed to fetch allotments", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllotments();
  }, []);

  const handleAutoAllocate = async () => {
    setIsAllocating(true);
    try {
      const res = await fetch("/api/allotment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Auto-allocation completed successfully!");
        setShowAllocationModal(false);
        await fetchAllotments();
      } else {
        alert(data.error || "Failed to auto-allocate rooms.");
      }
    } catch {
      alert("Failed to auto-allocate rooms.");
    } finally {
      setIsAllocating(false);
    }
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
            title="Occupied Beds"
            value={stats.occupied}
            icon={Users}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            title="Available Rooms"
            value={stats.available}
            icon={DoorOpen}
            gradient="from-orange-400 to-orange-600"
          />
          <StatCard
            title="Pending Students"
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
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading allotments database...</p>
          </div>
        ) : (
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
        )}

        {filteredRooms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No allotments found matching your criteria.
            </p>
          </div>
        )}

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
                onClick={handleAutoAllocate}
                disabled={isAllocating}
              >
                {isAllocating ? "Processing AI..." : "Start Allocation"}
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

