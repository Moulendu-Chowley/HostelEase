"use client";

import { Camera, CheckCircle, Loader2, XCircle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

type CameraMode = "entry" | "exit";

export interface RecognitionResult {
  studentId: string;
  studentName: string;
  rollNo: string;
  confidence: number;
  frameDataUrl: string;
  mode: CameraMode;
}

interface CameraFeedProps {
  isActive: boolean;
  onToggle: () => void;
  cameraMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  onRecognized: (result: RecognitionResult) => void;
  isSubmitting?: boolean;
  message?: string;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  isActive,
  onToggle,
  cameraMode,
  onModeChange,
  onRecognized,
  isSubmitting = false,
  message,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isRecognizingRef = useRef(false);
  const cooldownRef = useRef(false);

  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "matched" | "no-match"
  >("idle");
  const [lastMatch, setLastMatch] = useState<{
    name: string;
    confidence: number;
  } | null>(null);

  // Start / stop webcam
  useEffect(() => {
    const videoEl = videoRef.current;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isActive || !videoEl) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        videoEl.srcObject = stream;
        await videoEl.play();
        setScanStatus("idle");
      } catch {
        // Camera permission denied or unavailable
      }
    };

    void startCamera();

    return () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.srcObject = null;
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setScanStatus("idle");
    };
  }, [isActive]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  }, []);

  const runRecognition = useCallback(async () => {
    if (isRecognizingRef.current || cooldownRef.current) return;
    const frameDataUrl = captureFrame();
    if (!frameDataUrl) return;

    isRecognizingRef.current = true;
    setScanStatus("scanning");

    try {
      const res = await fetch("/api/attendance/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame_b64: frameDataUrl }),
      });

      const result = (await res.json()) as {
        matched: boolean;
        studentId?: string;
        studentName?: string;
        rollNo?: string;
        confidence?: number;
      };

      if (result.matched && result.studentId && result.studentName) {
        setScanStatus("matched");
        setLastMatch({
          name: result.studentName,
          confidence: result.confidence ?? 0,
        });

        onRecognized({
          studentId: result.studentId,
          studentName: result.studentName,
          rollNo: result.rollNo ?? "",
          confidence: result.confidence ?? 0,
          frameDataUrl,
          mode: cameraMode,
        });

        // 10-second cooldown so the same person isn't logged twice
        cooldownRef.current = true;
        setTimeout(() => {
          cooldownRef.current = false;
          setScanStatus("idle");
        }, 10_000);
      } else {
        setScanStatus("no-match");
        setTimeout(() => setScanStatus("idle"), 2000);
      }
    } catch {
      setScanStatus("idle");
    } finally {
      isRecognizingRef.current = false;
    }
  }, [captureFrame, cameraMode, onRecognized]);

  // Auto-scan every 2.5 seconds when camera is active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => void runRecognition(), 2500);
    return () => clearInterval(interval);
  }, [isActive, runRecognition]);

  const renderStatusOverlay = () => {
    if (scanStatus === "scanning") {
      return (
        <div className="flex items-center gap-2 text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning…</span>
        </div>
      );
    }
    if (scanStatus === "matched" && lastMatch) {
      return (
        <div className="flex items-center gap-2 text-green-300">
          <CheckCircle className="h-4 w-4" />
          <span>
            {lastMatch.name} · {Math.round(lastMatch.confidence * 100)}%
          </span>
        </div>
      );
    }
    if (scanStatus === "no-match") {
      return (
        <div className="flex items-center gap-2 text-yellow-300">
          <XCircle className="h-4 w-4" />
          <span>No match</span>
        </div>
      );
    }
    return <span className="text-gray-400 text-xs">Auto-scanning active…</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Camera className="h-6 w-6 text-blue-600" />
        Facial Recognition
      </h2>

      <div className="space-y-4">
        {/* Video feed */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 text-white rounded-lg px-3 py-2 text-xs flex justify-between items-center">
                {renderStatusOverlay()}
                <span className="text-gray-400">DeepFace</span>
              </div>
            </>
          ) : (
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mb-4 mx-auto opacity-50" />
              <p className="text-lg">Camera Feed</p>
              <p className="text-sm opacity-70">Click button to start</p>
            </div>
          )}
        </div>

        {/* Start / Stop */}
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

        {/* Entry / Exit mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onModeChange("entry")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              cameraMode === "entry"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Entry Camera
          </button>
          <button
            type="button"
            onClick={() => onModeChange("exit")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              cameraMode === "exit"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Exit Camera
          </button>
        </div>

        {/* Status / error messages */}
        {message && (
          <p
            className={`text-sm rounded-lg p-2 ${
              message.toLowerCase().includes("error") ||
              message.toLowerCase().includes("fail")
                ? "text-red-700 bg-red-50"
                : "text-emerald-700 bg-emerald-50"
            }`}
          >
            {message}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm text-blue-700 bg-blue-50 rounded-lg p-2 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Logging attendance…
          </p>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800">
          <strong>Auto-mode:</strong> Camera scans every 2.5 s and logs
          attendance automatically when a registered student is recognised.
          10-second cooldown prevents duplicate entries.
        </div>

        <canvas ref={canvasRef} className="hidden" />
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
