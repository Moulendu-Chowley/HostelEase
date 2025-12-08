import React from "react";
import { FaCamera } from "react-icons/fa";

interface CameraFeedProps {
  isActive: boolean;
  onToggle: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  isActive,
  onToggle,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaCamera className="text-blue-600" />
        Facial Recognition
      </h2>

      <div className="space-y-4">
        {/* Camera Feed Placeholder */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
          {isActive ? (
            <div className="text-center">
              <div className="relative">
                <div className="w-48 h-48 border-4 border-green-400 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <FaCamera className="text-6xl text-green-400" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-56 h-56 border-4 border-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              <p className="text-white font-semibold">🎥 Camera Active</p>
              <p className="text-green-400 text-sm">Ready to scan faces</p>
            </div>
          ) : (
            <div className="text-center text-white">
              <FaCamera className="text-6xl mb-4 mx-auto opacity-50" />
              <p className="text-lg">Camera Feed</p>
              <p className="text-sm opacity-70">Click button to start</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <button
          onClick={onToggle}
          className={`w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          }`}
        >
          {isActive ? "⏹️ Stop Recognition" : "▶️ Start Recognition"}
        </button>

        {/* API Integration Note */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-xs text-yellow-800">
            <strong>🔌 API Ready:</strong> Connect OpenCV/DeepFace model here
          </p>
        </div>
      </div>
    </div>
  );
};

interface RecognitionStatsProps {
  successful: number;
  failed: number;
}

export const RecognitionStats: React.FC<RecognitionStatsProps> = ({
  successful,
  failed,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
      <h3 className="font-semibold mb-2 text-gray-800">Today&apos;s Scans</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white rounded-lg p-2">
          <p className="text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600">{successful}</p>
        </div>
        <div className="bg-white rounded-lg p-2">
          <p className="text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failed}</p>
        </div>
      </div>
    </div>
  );
};
