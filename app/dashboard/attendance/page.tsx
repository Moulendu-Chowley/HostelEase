"use client";
import {
  AttendanceLogTable,
  CameraFeed,
  PageContainer,
  StatCard,
} from "@/components";
import { type RecognitionResult } from "@/components/features/FacialRecognition";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AttendanceRow = {
  id: string;
  name: string;
  rollNo: string;
  time: string;
  type: "entry" | "exit";
  image: string;
  date: string;
};

type StudentOption = {
  id: string;
  name: string;
  rollNo: string;
};

type AttendancePayload = {
  data: AttendanceRow[];
  students: StudentOption[];
  stats: {
    present: number;
    absent: number;
    onLeave: number;
    lateEntry: number;
  };
};

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [recognitionMode, setRecognitionMode] = useState(false);
  const [cameraMode, setCameraMode] = useState<"entry" | "exit">("entry");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    lateEntry: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadAttendance = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as
        | AttendancePayload
        | { error: string };

      if (!response.ok || "error" in payload) {
        setMessage("Failed to load attendance data.");
        return;
      }

      setAttendanceData(payload.data);
      setStudents(payload.students);
      setStats(payload.stats);

      if (!selectedStudentId && payload.students.length > 0) {
        setSelectedStudentId(payload.students[0].id);
      }
    } catch {
      setMessage("Unable to connect to attendance service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const filteredData = useMemo(
    () =>
      attendanceData.filter((entry) => {
        if (selectedFilter === "all") return true;
        return entry.type === selectedFilter;
      }),
    [attendanceData, selectedFilter],
  );

  const handleRecognized = async (result: RecognitionResult) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: result.mode,
          studentId: result.studentId,
          cameraLabel:
            result.mode === "entry" ? "Main Gate Cam" : "Exit Gate Cam",
          confidence: result.confidence,
          frameDataUrl: result.frameDataUrl,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setMessage(data.error ?? "Failed to log attendance.");
        return;
      }

      setMessage(`✓ ${result.studentName} — ${result.mode} logged`);
      await loadAttendance();
    } catch {
      setMessage("Failed to log attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="mt-4 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            />
          </div>
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
              cameraMode={cameraMode}
              onModeChange={setCameraMode}
              onRecognized={handleRecognized}
              isSubmitting={isSubmitting}
              message={message}
            />
          </motion.div>

          {/* Entry/Exit Logs - Using AttendanceLogTable Component */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            {isLoading && (
              <div className="mb-3 text-sm text-gray-600">
                Loading attendance...
              </div>
            )}
            <AttendanceLogTable
              data={filteredData}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
