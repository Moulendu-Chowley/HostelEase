import { motion } from "framer-motion";
import React from "react";

interface Team {
  id: number;
  name: string;
  captain: string;
  wins: number;
  losses: number;
  points: number;
}

interface PointsTableProps {
  teams: Team[];
  tournamentName: string;
}

export const PointsTable: React.FC<PointsTableProps> = ({
  teams,
  tournamentName,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🏆 {tournamentName}
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Points Table
        </h3>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="p-3 text-left">Pos</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Captain</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-b hover:bg-gray-50 ${
                    index === 0 ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="p-3 font-bold">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : index + 1}
                  </td>
                  <td className="p-3 font-semibold">{team.name}</td>
                  <td className="p-3 text-gray-600">{team.captain}</td>
                  <td className="p-3 text-center text-green-600 font-bold">
                    {team.wins}
                  </td>
                  <td className="p-3 text-center text-red-600 font-bold">
                    {team.losses}
                  </td>
                  <td className="p-3 text-center font-bold text-blue-600">
                    {team.points}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface CaptainSelectionProps {
  onSelect: () => void;
  isSelecting: boolean;
}

export const CaptainSelection: React.FC<CaptainSelectionProps> = ({
  onSelect,
  isSelecting,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        ⭐ Captain Selection
      </h2>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
          <p className="text-sm text-gray-700 mb-3">
            AI-powered captain selection based on:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Past performance stats</li>
            <li>✓ Leadership qualities</li>
            <li>✓ Team coordination</li>
            <li>✓ Availability & commitment</li>
            <li>✓ Player ratings</li>
          </ul>
        </div>

        <button
          onClick={onSelect}
          disabled={isSelecting}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
        >
          {isSelecting ? "🔄 Analyzing Dataset..." : "🤖 Auto-Select Captain"}
        </button>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
          <p className="text-xs text-blue-800">
            <strong>🔌 ML Integration:</strong> Connect dataset with player
            statistics, match history, and performance metrics
          </p>
        </div>
      </div>
    </div>
  );
};
