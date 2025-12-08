import { motion } from "framer-motion";
import Badge from "../ui/Badge";

interface AttendanceLog {
  id: number;
  name: string;
  rollNo: string;
  time: string;
  type: "entry" | "exit";
  image: string;
  date: string;
}

interface AttendanceLogTableProps {
  logs: AttendanceLog[];
  filter?: "all" | "entry" | "exit";
}

export default function AttendanceLogTable({
  logs,
  filter = "all",
}: AttendanceLogTableProps) {
  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.type === filter
  );

  return (
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
          {filteredLogs.map((entry, index) => (
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
                <Badge variant={entry.type === "entry" ? "success" : "warning"}>
                  {entry.type === "entry" ? "📥 Entry" : "📤 Exit"}
                </Badge>
              </td>
              <td className="p-3">
                <Badge variant="info">✓ Verified</Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
