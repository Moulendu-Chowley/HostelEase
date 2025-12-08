import { Camera } from "lucide-react";
import Card from "../ui/Card";

interface CameraFeedProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function CameraFeed({ isActive, onToggle }: CameraFeedProps) {
  return (
    <Card title="Facial Recognition Camera" className="bg-white">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
        {isActive ? (
          <div className="text-center">
            <div className="relative">
              <div className="w-48 h-48 border-4 border-green-400 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Camera className="h-16 w-16 text-green-400" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-56 h-56 border-4 border-blue-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <p className="text-white font-semibold">🎥 Camera Active</p>
            <p className="text-green-400 text-sm">Ready to scan faces</p>
          </div>
        ) : (
          <div className="text-center text-white">
            <Camera className="h-16 w-16 mb-4 mx-auto opacity-50" />
            <p className="text-lg">Camera Feed</p>
            <p className="text-sm opacity-70">Click button to start</p>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
          isActive
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        }`}
      >
        {isActive ? "⏹️ Stop Recognition" : "▶️ Start Recognition"}
      </button>

      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
        <p className="text-xs text-blue-800">
          <strong>🔌 API Ready:</strong> Connect OpenCV/DeepFace model here
        </p>
      </div>
    </Card>
  );
}
