import { motion } from "framer-motion";
import React from "react";

interface AttendanceEntry {
  id: number;
  name: string;
  rollNo: string;
  time: string;
  type: "entry" | "exit";
  image: string;
  date: string;
}

interface AttendanceLogTableProps {
  data: AttendanceEntry[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({
  data,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Entry/Exit Logs</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["all", "entry", "exit"].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === filter
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white sticky top-0">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{entry.image}</div>
                    <span className="font-semibold">{entry.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-600">{entry.rollNo}</td>
                <td className="p-3 text-gray-600">{entry.time}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      entry.type === "entry"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {entry.type === "entry" ? "📥 Entry" : "📤 Exit"}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    ✓ Verified
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
