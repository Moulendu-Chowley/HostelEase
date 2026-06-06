"use client";

import { Button, Input, Modal } from "@/components";
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
import { useEffect, useState } from "react";

type Complaint = {
  id: string;
  title: string;
  description: string;
  student: string;
  room: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "resolved";
  date: string;
  time: string;
};

export default function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Electrical");
  const [newPriority, setNewPriority] = useState("medium");

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (e) {
      console.error("Failed to fetch complaints", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchComplaints();
  }, []);

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          priority: newPriority,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewCategory("Electrical");
        setNewPriority("medium");
        await fetchComplaints();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to log complaint.");
      }
    } catch {
      alert("Failed to log complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusProgress = async (id: string, currentStatus: string) => {
    let nextStatus = "pending";
    if (currentStatus === "pending") nextStatus = "in-progress";
    else if (currentStatus === "in-progress") nextStatus = "resolved";
    else return;

    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (res.ok) {
        await fetchComplaints();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update complaint status.");
      }
    } catch {
      alert("Failed to update complaint status.");
    }
  };

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
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading complaints register...</p>
        </div>
      ) : (
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityColor(
                      complaint.priority
                    )}`}
                  >
                    {complaint.priority}
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
                    {complaint.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusProgress(complaint.id, complaint.status)}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                      >
                        {complaint.status === "pending" ? "Start Fix" : "Mark Resolved"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredComplaints.length === 0 && !isLoading && (
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
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-semibold hover:shadow-blue-500/50"
      >
        <Plus className="h-6 w-6" />
        New Complaint
      </motion.button>

      {/* Add Complaint Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="File a New Complaint"
        >
          <form onSubmit={handleAddComplaint} className="space-y-4">
            <Input
              label="Issue Title"
              type="text"
              placeholder="e.g. WiFi broken"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe the issue in detail..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Network">Network</option>
                <option value="Security">Security</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Filing..." : "File Complaint"}
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
