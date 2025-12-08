"use client";
import {
  AttendanceLogTable,
  CameraFeed,
  PageContainer,
  StatCard,
} from "@/components";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck, UserX } from "lucide-react";
import { useState } from "react";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [recognitionMode, setRecognitionMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data for entry/exit logs
  const attendanceData = [
    {
      id: 1,
      name: "Rahul Sharma",
      rollNo: "HS2021001",
      time: "08:45 AM",
      type: "entry" as const,
      image: "👨",
      date: "2025-12-07",
    },
    {
      id: 2,
      name: "Priya Singh",
      rollNo: "HS2021002",
      time: "09:12 AM",
      type: "entry" as const,
      image: "👩",
      date: "2025-12-07",
    },
    {
      id: 3,
      name: "Amit Kumar",
      rollNo: "HS2021003",
      time: "10:30 AM",
      type: "exit" as const,
      image: "👨",
      date: "2025-12-07",
    },
    {
      id: 4,
      name: "Sneha Patel",
      rollNo: "HS2021004",
      time: "11:15 AM",
      type: "entry" as const,
      image: "👩",
      date: "2025-12-07",
    },
    {
      id: 5,
      name: "Vikram Reddy",
      rollNo: "HS2021005",
      time: "02:20 PM",
      type: "exit" as const,
      image: "👨",
      date: "2025-12-07",
    },
    {
      id: 6,
      name: "Ananya Das",
      rollNo: "HS2021006",
      time: "03:45 PM",
      type: "entry" as const,
      image: "👩",
      date: "2025-12-07",
    },
    {
      id: 7,
      name: "Rohan Verma",
      rollNo: "HS2021007",
      time: "05:10 PM",
      type: "exit" as const,
      image: "👨",
      date: "2025-12-07",
    },
    {
      id: 8,
      name: "Kavya Iyer",
      rollNo: "HS2021008",
      time: "06:30 PM",
      type: "entry" as const,
      image: "👩",
      date: "2025-12-07",
    },
  ];

  const stats = {
    present: 142,
    absent: 18,
    onLeave: 5,
    lateEntry: 12,
  };

  const filteredData = attendanceData.filter((entry) => {
    if (selectedFilter === "all") return true;
    return entry.type === selectedFilter;
  });

  return (
    <PageContainer gradient="from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Attendance Management
          </h1>
          <p className="text-gray-600">
            AI-powered facial recognition & real-time tracking
          </p>
        </motion.div>

        {/* Stats Cards - Using StatCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Present"
            value={stats.present}
            icon={UserCheck}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            title="Absent"
            value={stats.absent}
            icon={UserX}
            gradient="from-red-400 to-red-600"
          />
          <StatCard
            title="On Leave"
            value={stats.onLeave}
            icon={Calendar}
            gradient="from-yellow-400 to-yellow-600"
          />
          <StatCard
            title="Late Entry"
            value={stats.lateEntry}
            icon={Clock}
            gradient="from-orange-400 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facial Recognition Panel - Using CameraFeed Component */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <CameraFeed
              isActive={recognitionMode}
              onToggle={() => setRecognitionMode(!recognitionMode)}
            />
          </motion.div>

          {/* Entry/Exit Logs - Using AttendanceLogTable Component */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <AttendanceLogTable
              data={filteredData}
              filter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
