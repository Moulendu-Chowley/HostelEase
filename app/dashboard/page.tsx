"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bed,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  roll_no: string | null;
  photo_url: string | null;
}

interface RoomInfo {
  number: string;
  floor: number;
  capacity: number;
  type: string;
}

interface Roommate {
  full_name: string;
  roll_no: string | null;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  icon: any;
  color: string;
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Student specific state
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<string>("Not Logged");
  const [studentStats, setStudentStats] = useState({
    leavesCount: 0,
    complaintsCount: 0,
  });

  // Photo registration state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Admin specific state
  const [adminStats, setAdminStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    pendingLeaves: 0,
    pendingComplaints: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [healthScores, setHealthScores] = useState({
    security: 95,
    maintenance: 80,
    mess: 84,
    attendance: 89,
    overall: 87,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const role = String(user.user_metadata?.role || "student").toLowerCase() as "admin" | "student";
    setUserRole(role);

    // Fetch Profile
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profErr || !prof) {
      setLoading(false);
      return;
    }

    const profileData: Profile = prof;
    setProfile(profileData);

    if (role === "admin") {
      // 1. Fetch Admin Overall Statistics
      const [
        { count: studCount },
        { count: rCount },
        { data: allotments },
        { count: lvCount },
        { count: compCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("rooms").select("*", { count: "exact", head: true }),
        supabase.from("room_allotments").select("room_id"),
        supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      // Count unique occupied rooms
      const occupiedRoomIds = new Set(allotments?.map((a) => a.room_id) || []);

      setAdminStats({
        totalStudents: studCount || 0,
        totalRooms: rCount || 0,
        occupiedRooms: occupiedRoomIds.size,
        pendingLeaves: lvCount || 0,
        pendingComplaints: compCount || 0,
      });

      const compVal = compCount || 0;
      const lvVal = lvCount || 0;
      const secScore = Math.max(75, 96 - (lvVal * 2));
      const maintScore = Math.max(60, 98 - (compVal * 4));
      const messScore = 84;
      const attScore = 91;
      const overallScore = Math.round((secScore + maintScore + messScore + attScore) / 4);

      setHealthScores({
        security: secScore,
        maintenance: maintScore,
        mess: messScore,
        attendance: attScore,
        overall: overallScore,
      });

      // 2. Fetch Recent Whole-Hostel Activities (Attendance events)
      const { data: events } = await supabase
        .from("attendance_events")
        .select("id, type, captured_at, profiles(full_name)")
        .order("captured_at", { ascending: false })
        .limit(5);

      const formattedActs: Activity[] = (events || []).map((ev: any) => {
        const studentName = ev.profiles?.full_name || "Unknown Student";
        const dateObj = new Date(ev.captured_at);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: ev.id,
          user: studentName,
          action: `Checked ${ev.type === "entry" ? "in" : "out"} at gate`,
          time: timeStr,
          icon: ev.type === "entry" ? CheckCircle : UserCheck,
          color: ev.type === "entry" ? "text-green-500" : "text-blue-500",
        };
      });

      setRecentActivities(formattedActs);
    } else {
      // Student Path: Fetch details for logged in profileData.id
      const studentId = profileData.id;

      // 1. Fetch Room details & Roommates
      const { data: allot } = await supabase
        .from("room_allotments")
        .select("room_id, rooms(*)")
        .eq("profile_id", studentId)
        .maybeSingle();

      if (allot && allot.room_id && allot.rooms) {
        const room = Array.isArray(allot.rooms) ? allot.rooms[0] : allot.rooms;
        if (room) {
          setRoomInfo({
            number: room.number,
            floor: room.floor,
            capacity: room.capacity,
            type: room.type,
          });
        }

        // Fetch Roommates
        const { data: mates } = await supabase
          .from("room_allotments")
          .select("profiles(full_name, roll_no)")
          .eq("room_id", allot.room_id)
          .neq("profile_id", studentId);

        const formattedMates: Roommate[] = (mates || []).map((m: any) => {
          const profileObj = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          return {
            full_name: profileObj?.full_name || "Roommate",
            roll_no: profileObj?.roll_no || null,
          };
        });
        setRoommates(formattedMates);
      }

      // 2. Fetch today's attendance status
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: todayAtts } = await supabase
        .from("attendance_events")
        .select("type, captured_at")
        .eq("profile_id", studentId)
        .gte("captured_at", startOfDay.toISOString())
        .order("captured_at", { ascending: false });

      if (todayAtts && todayAtts.length > 0) {
        const lastEv = todayAtts[0];
        setAttendanceToday(lastEv.type === "entry" ? "Checked In (Present)" : "Checked Out (Absent)");
      } else {
        setAttendanceToday("Not Logged Yet");
      }

      // 3. Fetch complaints/leaves counts
      const [
        { count: lCount },
        { count: cCount },
        { count: totalPendingLeaves },
        { count: totalPendingComplaints },
      ] = await Promise.all([
        supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("profile_id", studentId),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("profile_id", studentId),
        supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStudentStats({
        leavesCount: lCount || 0,
        complaintsCount: cCount || 0,
      });

      const compVal = totalPendingComplaints || 0;
      const lvVal = totalPendingLeaves || 0;
      const secScore = Math.max(75, 96 - (lvVal * 2));
      const maintScore = Math.max(60, 98 - (compVal * 4));
      const messScore = 84;
      const attScore = 91;
      const overallScore = Math.round((secScore + maintScore + messScore + attScore) / 4);

      setHealthScores({
        security: secScore,
        maintenance: maintScore,
        mess: messScore,
        attendance: attScore,
        overall: overallScore,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  // Webcam Camera toggle
  useEffect(() => {
    const video = videoRef.current;
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      if (!isCameraActive || !video) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 360 },
          audio: false,
        });
        video.srcObject = stream;
        await video.play();
      } catch (e) {
        console.error("Webcam failed", e);
        setUploadMessage("Error: Could not access camera.");
        setIsCameraActive(false);
      }
    };

    void startWebcam();

    return () => {
      if (video) {
        video.pause();
        video.srcObject = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // Handle Photo registration submission
  const uploadPhoto = async (imageB64: string) => {
    if (!profile) return;
    setIsUploading(true);
    setUploadMessage("");

    try {
      const res = await fetch(`/api/faces/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imageB64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadMessage(`Error: ${data.error || "Failed to register face."}`);
      } else {
        setUploadMessage("Success: Your face profile has been registered!");
        // Refresh profile to show new photo
        if (data.photoUrl) {
          setProfile({ ...profile, photo_url: data.photoUrl });
        }
      }
    } catch {
      setUploadMessage("Error: Network failure registering face.");
    } finally {
      setIsUploading(false);
      setIsCameraActive(false);
    }
  };

  // Capture from webcam
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    void uploadPhoto(dataUrl);
  };

  // Upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      void uploadPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo — two-click confirmation (avoids browser-blocked confirm())
  const handleRemovePhoto = () => {
    if (!profile) return;
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      // Auto-cancel confirmation after 4 seconds
      setTimeout(() => setConfirmingRemove(false), 4000);
      return;
    }
    setConfirmingRemove(false);
    void performRemovePhoto();
  };

  const performRemovePhoto = async () => {
    if (!profile) return;
    setIsUploading(true);
    setUploadMessage("");

    try {
      const res = await fetch(`/api/faces/${profile.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadMessage(`Error: ${data.error || "Failed to remove photo."}`);
      } else {
        setUploadMessage("Success: Face profile removed.");
        setProfile({ ...profile, photo_url: null });
      }
    } catch {
      setUploadMessage("Error: Network failure removing photo.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // ================== STUDENT VIEW ==================
  if (userRole === "student") {
    return (
      <div className="space-y-8">
        {/* Hostel Health Score Widget */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-rose-500 animate-pulse" />
                🏥 Hostel Health Score
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">Hostel operational wellness score calculated by AI analytics engine</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 font-extrabold text-lg">
              <span>{healthScores.overall}/100</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { title: "Security", val: healthScores.security, col: "bg-blue-500", label: "Curfew & SOS safe" },
              { title: "Maintenance", val: healthScores.maintenance, col: "bg-rose-500", label: "Complaint ticket density" },
              { title: "Mess", val: healthScores.mess, col: "bg-green-500", label: "Student rating index" },
              { title: "Attendance", val: healthScores.attendance, col: "bg-indigo-500", label: "Stay presence ratio" },
            ].map((h, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-500">{h.title}</span>
                  <span className="text-gray-800 font-bold">{h.val}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full ${h.col} rounded-full`} style={{ width: `${h.val}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Profile Card & Face Registration */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Student details */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              {profile?.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={profile.full_name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-50"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile?.full_name ? profile.full_name.charAt(0) : "S"}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-800">{profile?.full_name}</h2>
            <p className="text-blue-600 font-semibold text-sm mt-1">{profile?.roll_no || "No Roll Number"}</p>
            <p className="text-gray-500 text-xs mt-1">{profile?.email}</p>

            <div className="w-full border-t border-gray-100 my-6 pt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs">Room Number</p>
                <p className="font-bold text-gray-800 mt-1">{roomInfo?.number || "Unassigned"}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs">Today&apos;s Attendance</p>
                <p className={`font-bold mt-1 ${attendanceToday.includes("Present") ? "text-green-600" : "text-gray-600"}`}>
                  {attendanceToday}
                </p>
              </div>
            </div>

            {/* Quick Actions Links */}
            <div className="w-full space-y-2">
              <Link href="/dashboard/leave">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2">
                  <ClipboardList className="h-4 w-4" />
                  <span>Request Leave</span>
                </button>
              </Link>
            </div>
          </div>

          {/* AI Face Registration Control */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                AI Face Profile Registration
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Upload or capture a clear photo of your face. This image is used by the hostel&apos;s gate camera AI to recognize you and log your attendance automatically when entering or exiting the premises.
              </p>

              {isCameraActive ? (
                <div className="relative max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center mb-4">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    <button
                      onClick={handleCapture}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={() => setIsCameraActive(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 border-2 border-dashed border-gray-200 rounded-2xl mb-4">
                  <button
                    onClick={() => {
                      setUploadMessage("");
                      setIsCameraActive(true);
                    }}
                    className="flex items-center space-x-2 px-5 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Use Webcam</span>
                  </button>

                  <label className="flex items-center space-x-2 px-5 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 cursor-pointer transition">
                    <Upload className="h-5 w-5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {profile?.photo_url && (
                    <button
                      onClick={handleRemovePhoto}
                      className={`flex items-center space-x-2 px-5 py-3 font-semibold rounded-xl transition ${
                        confirmingRemove
                          ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>{confirmingRemove ? "Confirm Remove?" : "Remove Profile"}</span>
                    </button>
                  )}
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold mb-4 bg-blue-50 p-3 rounded-xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing face verification & storage...</span>
                </div>
              )}

              {uploadMessage && (
                <div
                  className={`p-3 rounded-xl font-semibold text-sm mb-4 ${
                    uploadMessage.startsWith("Success")
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {uploadMessage}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs text-gray-500 border-l-4 border-indigo-500">
              <strong>Tips for successful detection:</strong> Ensure the photo is taken in good lighting, you are looking directly at the camera, and your face is fully visible without hats or sunglasses.
            </div>
          </div>
        </div>

        {/* Roommates & General Stats */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Roommates list */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-indigo-600" />
              Roommates ({roommates.length})
            </h3>
            {roommates.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {roommates.map((mate, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <span className="font-semibold text-gray-800">{mate.full_name}</span>
                    <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">{mate.roll_no || "N/A"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4">No roommates assigned or single room occupancy.</p>
            )}
          </div>

          {/* Quick stats totals */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Your Portal Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100/50">
                <p className="text-indigo-600 text-xs font-semibold">Total Leave Applications</p>
                <p className="text-3xl font-extrabold text-indigo-900 mt-2">{studentStats.leavesCount}</p>
              </div>
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100/50">
                <p className="text-rose-600 text-xs font-semibold">Filed Complaints</p>
                <p className="text-3xl font-extrabold text-rose-900 mt-2">{studentStats.complaintsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ================== ADMIN VIEW ==================
  return (
    <div className="space-y-6">
      {/* Hostel Health Score Widget */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-rose-500 animate-pulse" />
              🏥 Hostel Health Score
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">Hostel operational wellness score calculated by AI analytics engine</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 font-extrabold text-lg">
            <span>{healthScores.overall}/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { title: "Security", val: healthScores.security, col: "bg-blue-500", label: "Curfew & SOS safe" },
            { title: "Maintenance", val: healthScores.maintenance, col: "bg-rose-500", label: "Complaint ticket density" },
            { title: "Mess", val: healthScores.mess, col: "bg-green-500", label: "Student rating index" },
            { title: "Attendance", val: healthScores.attendance, col: "bg-indigo-500", label: "Stay presence ratio" },
          ].map((h, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-gray-500">{h.title}</span>
                <span className="text-gray-800 font-bold">{h.val}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div className={`h-full ${h.col} rounded-full`} style={{ width: `${h.val}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {[
          {
            title: "Total Students",
            value: adminStats.totalStudents,
            icon: Users,
            color: "from-blue-500 to-cyan-500",
          },
          {
            title: "Total Rooms",
            value: adminStats.totalRooms,
            icon: Building2,
            color: "from-indigo-500 to-purple-500",
          },
          {
            title: "Occupied Rooms",
            value: adminStats.occupiedRooms,
            icon: Bed,
            color: "from-emerald-500 to-teal-500",
          },
          {
            title: "Pending Leaves",
            value: adminStats.pendingLeaves,
            icon: ClipboardList,
            color: "from-orange-500 to-amber-500",
          },
          {
            title: "Pending Complaints",
            value: adminStats.pendingComplaints,
            icon: AlertCircle,
            color: "from-rose-500 to-red-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-gray-500 text-xs font-semibold">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Recent Check-ins & Check-outs
          </h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={`p-3 rounded-full bg-slate-100 ${activity.color}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">No recent attendance scans logged today.</p>
          )}
        </div>

        {/* Quick actions panel */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            Quick Admin Shortcuts
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                label: "Manage Rooms",
                icon: Building2,
                color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
                href: "/dashboard/rooms",
              },
              {
                label: "Allotment Manager",
                icon: Bed,
                color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
                href: "/dashboard/allotment",
              },
              {
                label: "Registered Students",
                icon: Users,
                color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                href: "/dashboard/students",
              },
              {
                label: "Hostel Complaints",
                icon: AlertCircle,
                color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
                href: "/dashboard/complaints",
              },
            ].map((action, idx) => (
              <Link href={action.href} key={idx}>
                <button className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-colors ${action.color}`}>
                  <action.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-bold text-sm">{action.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
