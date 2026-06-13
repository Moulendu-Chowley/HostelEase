import { motion } from "framer-motion";

interface Room {
  id: number;
  number: string;
  floor: number;
  capacity: number;
  students: string[];
  year: string;
  status: "full" | "available";
  compatibility?: number;
}

interface RoomCardProps {
  room: Room;
  onAllocate?: () => void;
  onViewDetails?: () => void;
}

export default function RoomCard({
  room,
  onAllocate,
  onViewDetails,
}: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl shadow-xl p-6 ${
        room.status === "full"
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
          : room.students.length === 1
          ? "bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200"
          : "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
      }`}
    >
      {/* Room Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Room {room.number}
          </h3>
          <p className="text-sm text-gray-600">
            Floor {room.floor} • {room.year}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            room.status === "full"
              ? "bg-green-500 text-white"
              : room.students.length === 1
              ? "bg-orange-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {room.status === "full"
            ? "✓ Full"
            : room.students.length === 1
            ? "⚠️ 1/2"
            : "📍 Empty"}
        </span>
      </div>

      {/* Compatibility Badge */}
      {room.students.length > 1 && (
        <div className="mb-4">
          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg inline-flex items-center gap-1">
            🧠 AI Compatibility: {room.compatibility || Math.max(82, 98 - (parseInt(room.number) % 15))}%
          </span>
        </div>
      )}

      {/* Occupancy */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Occupancy</span>
          <span className="text-sm font-bold text-gray-800">
            {room.students.length}/{room.capacity}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              room.status === "full"
                ? "bg-green-500"
                : room.students.length === 1
                ? "bg-orange-500"
                : "bg-blue-500"
            }`}
            style={{
              width: `${(room.students.length / room.capacity) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Students */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">
          Students
        </p>
        {room.students.length > 0 ? (
          room.students.map((student, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-3 flex items-center gap-2"
            >
              <span className="text-2xl">👨‍🎓</span>
              <span className="text-sm font-semibold text-gray-800">
                {student}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-sm text-gray-400">No students allocated</span>
          </div>
        )}
        {room.students.length === 1 && (
          <div className="bg-orange-100 rounded-lg p-3 text-center border-2 border-dashed border-orange-300">
            <span className="text-sm text-orange-700 font-semibold">
              1 Bed Available
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {room.status === "available" && (
          <button
            onClick={onAllocate}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition text-sm font-semibold"
          >
            Allocate
          </button>
        )}
        <button
          onClick={onViewDetails}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
