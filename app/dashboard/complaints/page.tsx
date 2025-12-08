"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { useState } from "react";

export default function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const complaints = [
    {
      id: 1,
      title: "AC Not Working",
      description: "The air conditioning in my room has stopped working",
      student: "John Doe",
      room: "101",
      category: "Electrical",
      priority: "high",
      status: "pending",
      date: "2025-12-05",
      time: "10:30 AM",
    },
    {
      id: 2,
      title: "Water Leakage",
      description: "There is water leaking from the bathroom ceiling",
      student: "Jane Smith",
      room: "102",
      category: "Plumbing",
      priority: "critical",
      status: "in-progress",
      date: "2025-12-06",
      time: "2:15 PM",
    },
    {
      id: 3,
      title: "Broken Window",
      description: "Window glass is cracked and needs replacement",
      student: "Mike Johnson",
      room: "201",
      category: "General",
      priority: "medium",
      status: "resolved",
      date: "2025-12-03",
      time: "9:00 AM",
    },
    {
      id: 4,
      title: "WiFi Connection Issues",
      description: "Internet connection is very slow and keeps disconnecting",
      student: "Sarah Williams",
      room: "203",
      category: "Network",
      priority: "medium",
      status: "pending",
      date: "2025-12-07",
      time: "11:45 AM",
    },
    {
      id: 5,
      title: "Door Lock Broken",
      description: "Room door lock is not working properly",
      student: "Tom Brown",
      room: "301",
      category: "Security",
      priority: "high",
      status: "in-progress",
      date: "2025-12-06",
      time: "4:30 PM",
    },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.room.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "in-progress":
        return <Wrench className="h-5 w-5" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Complaint Management
        </h1>
        <p className="text-gray-600">Track and manage maintenance complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <MessageSquare className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.pending}
              </p>
            </div>
            <Clock className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.inProgress}
              </p>
            </div>
            <Wrench className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.resolved}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "in-progress", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                  ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {status
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComplaints.map((complaint, index) => (
          <motion.div
            key={complaint.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div
              className={`h-1 ${
                complaint.priority === "critical"
                  ? "bg-red-500"
                  : complaint.priority === "high"
                  ? "bg-orange-500"
                  : complaint.priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
            />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {complaint.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {complaint.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{complaint.student}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Room {complaint.room}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{complaint.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{complaint.category}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {getStatusIcon(complaint.status)}
                  <span className="text-sm font-semibold">
                    {complaint.status
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                    View Details
                  </button>
                  {complaint.status !== "resolved" && (
                    <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm">
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No complaints found matching your criteria
          </p>
        </div>
      )}

      {/* Add Complaint Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-semibold hover:shadow-blue-500/50"
      >
        <Plus className="h-6 w-6" />
        New Complaint
      </motion.button>
    </div>
  );
}
