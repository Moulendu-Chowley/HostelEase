"use client";

import { Button, Input, Modal, StatCard } from "@/components";
import { motion } from "framer-motion";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaveRequest {
  id: string;
  studentName: string;
  rollNo: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

export default function LeavePage() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState([
    { title: "Pending Requests", value: "0", icon: Clock, gradient: "from-orange-500 to-red-600" },
    { title: "Approved", value: "0", icon: CheckCircle, gradient: "from-green-500 to-emerald-600" },
    { title: "Rejected", value: "0", icon: XCircle, gradient: "from-red-500 to-rose-600" },
    { title: "Total Applications", value: "0", icon: FileText, gradient: "from-blue-500 to-indigo-600" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newFromDate, setNewFromDate] = useState("");
  const [newToDate, setNewToDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leave");
      const data = await res.json();
      if (res.ok) {
        setLeaveRequests(data.requests || []);
        if (data.stats) {
          setStats([
            { title: "Pending Requests", value: String(data.stats.pending), icon: Clock, gradient: "from-orange-500 to-red-600" },
            { title: "Approved", value: String(data.stats.approved), icon: CheckCircle, gradient: "from-green-500 to-emerald-600" },
            { title: "Rejected", value: String(data.stats.rejected), icon: XCircle, gradient: "from-red-500 to-rose-600" },
            { title: "Total Applications", value: String(data.stats.total), icon: FileText, gradient: "from-blue-500 to-indigo-600" },
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch leaves", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeaves();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: newFromDate,
          toDate: newToDate,
          reason: newReason,
        }),
      });

      if (res.ok) {
        setShowApplicationModal(false);
        setNewFromDate("");
        setNewToDate("");
        setNewReason("");
        await fetchLeaves();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit leave application.");
      }
    } catch {
      alert("Failed to submit leave application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await fetchLeaves();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update leave request.");
      }
    } catch {
      alert("Failed to update leave request.");
    }
  };

  const filteredRequests =
    filterStatus === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FileText className="text-indigo-600" />
              Leave Management Portal
            </h1>
            <p className="text-gray-600">
              Apply for leave and track approval status
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FileText />}
            onClick={() => setShowApplicationModal(true)}
          >
            Apply for Leave
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-3">
          {(["all", "pending", "approved", "rejected"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all capitalize ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Leave Requests Table */}
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">Loading leave register...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Leave Applications
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                      Student
                    </th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                      Reason
                    </th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                      Applied On
                    </th>
                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">
                      Status
                    </th>
                    <th className="text-center py-4 px-6 text-gray-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {request.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.rollNo}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {request.reason}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="text-gray-800">{request.fromDate}</p>
                          <p className="text-gray-500">to {request.toDate}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {request.appliedOn}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {request.status === "approved" && "✓ "}
                          {request.status === "rejected" && "✗ "}
                          {request.status === "pending" && "⏳ "}
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-center">
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(request.id, "approved")}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(request.id, "rejected")}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Guidelines Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Leave Application Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Advance Notice
                </h3>
                <p className="text-gray-600 text-sm">
                  Apply at least 3 days in advance for planned leaves
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Approval Time
                </h3>
                <p className="text-gray-600 text-sm">
                  Applications are reviewed within 24 hours
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Emergency Leave
                </h3>
                <p className="text-gray-600 text-sm">
                  For emergencies, apply immediately with supporting documents
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Leave Limit
                </h3>
                <p className="text-gray-600 text-sm">
                  Maximum 15 days per semester, excluding medical emergencies
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Application Modal */}
      {showApplicationModal && (
        <Modal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          title="Apply for Leave"
        >
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <Input
              label="From Date"
              type="date"
              value={newFromDate}
              onChange={(e) => setNewFromDate(e.target.value)}
              required
            />
            <Input
              label="To Date"
              type="date"
              value={newToDate}
              onChange={(e) => setNewToDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter reason for leave..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowApplicationModal(false)}
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

