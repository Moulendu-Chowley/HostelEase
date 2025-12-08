import { motion } from "framer-motion";
import React from "react";

interface MessScheduleItem {
  week: number;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  duty: string;
}

interface MessScheduleProps {
  schedule: MessScheduleItem[];
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export const MessSchedule: React.FC<MessScheduleProps> = ({
  schedule,
  currentWeek,
  onWeekChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🍽️ Weekly Mess Rotation
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onWeekChange(currentWeek - 1)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            ← Prev Week
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition">
            Week {currentWeek}
          </button>
          <button
            onClick={() => onWeekChange(currentWeek + 1)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Next Week →
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {schedule.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{item.day}</h3>
                <p className="text-sm text-orange-600 font-semibold">
                  Duty: {item.duty}
                </p>
              </div>
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Week {item.week}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">🌅 Breakfast</p>
                <p className="text-gray-600">{item.breakfast}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">☀️ Lunch</p>
                <p className="text-gray-600">{item.lunch}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">🌙 Dinner</p>
                <p className="text-gray-600">{item.dinner}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface CommitteeMember {
  id: number;
  name: string;
  role: string;
  room: string;
  year: string;
  contact: string;
}

interface MessCommitteeProps {
  members: CommitteeMember[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export const MessCommittee: React.FC<MessCommitteeProps> = ({
  members,
  onGenerate,
  isGenerating,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        👥 Current Committee
      </h2>

      <div className="space-y-3">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{member.name}</h3>
                <p className="text-xs text-purple-600 font-semibold">
                  {member.role}
                </p>
              </div>
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                {member.year}
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>🏠 Room {member.room}</p>
              <p>📞 {member.contact}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        {isGenerating ? "⏳ Generating..." : "🎲 Auto-Generate New Committee"}
      </button>

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-yellow-800">
          <strong>🤖 AI Selection:</strong> Uses student dataset to select
          committee members based on performance, availability, and rotation
          fairness
        </p>
      </div>
    </div>
  );
};
