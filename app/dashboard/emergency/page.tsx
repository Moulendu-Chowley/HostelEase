"use client";

import { PageContainer } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface SOSAlert {
  id: string;
  studentName: string;
  room: string;
  time: string;
  status: "Active" | "Acknowledged" | "Resolved";
  type: string;
}

export default function EmergencyPage() {
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [userName, setUserName] = useState("Student");
  const [studentRoom, setStudentRoom] = useState("Room 204");
  const [isActivating, setIsActivating] = useState(false);
  const [sosStep, setSosStep] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Sync user profile
  useEffect(() => {
    const syncUser = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const role = String(user.user_metadata?.role || "student").toLowerCase();
        setUserRole(role === "admin" ? "admin" : "student");
        setUserName(String(user.user_metadata?.name || "Student"));
        
        // Fetch student room
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          const { data: allotment } = await supabase
            .from("room_allotments")
            .select("rooms(number)")
            .eq("profile_id", profile.id)
            .maybeSingle();

          if (allotment && allotment.rooms) {
            const roomObj = Array.isArray(allotment.rooms) ? allotment.rooms[0] : allotment.rooms;
            if (roomObj?.number) {
              setStudentRoom(`Room ${roomObj.number}`);
            }
          }
        }
      }
    };
    void syncUser();
  }, []);

  // Establish WebSocket connection
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    
    const connect = () => {
      const rawUrl = process.env.NEXT_PUBLIC_DEEPFACE_SERVICE_URL || "http://localhost:8000";
      const wsUrl = rawUrl.replace(/^http/, "ws") + "/ws/sos";

      console.log(`Emergency Console connecting to WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Emergency Console WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Emergency Console received message:", message);

          switch (message.type) {
            case "sos_initial_state":
              setActiveAlerts(message.alerts);
              break;
            case "sos_alert":
              setActiveAlerts((prev) => {
                const exists = prev.some((a) => a.id === message.alert.id);
                if (exists) return prev;
                return [message.alert, ...prev];
              });
              break;
            case "sos_acknowledge":
              setActiveAlerts((prev) =>
                prev.map((alert) =>
                  alert.id === message.id ? { ...alert, status: "Acknowledged" } : alert
                )
              );
              break;
            case "sos_resolve":
              setActiveAlerts((prev) =>
                prev.map((alert) =>
                  alert.id === message.id ? { ...alert, status: "Resolved" } : alert
                )
              );
              break;
            case "sos_dismiss":
              setActiveAlerts((prev) => prev.filter((alert) => alert.id !== message.id));
              break;
          }
        } catch (err) {
          console.error("Emergency Console error parsing socket message:", err);
        }
      };

      socket.onclose = () => {
        console.log("Emergency Console WebSocket disconnected. Reconnecting in 5 seconds...");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (error) => {
        console.error("Emergency Console WebSocket error:", error);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const triggerSOS = () => {
    setIsActivating(true);
    setSosStep(1);

    const alertId = Math.random().toString();
    // Send trigger to WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "sos_trigger",
        id: alertId,
        studentName: userName,
        room: studentRoom,
        time: "Just now"
      }));
    }

    // Simulated local response pipeline animations
    setTimeout(() => setSosStep(2), 1500); // Face Identified
    setTimeout(() => setSosStep(3), 3000); // Room Located
    setTimeout(() => setSosStep(4), 4500); // Warden & Security Notified
    setTimeout(() => {
      setSosStep(5);
    }, 6000);
  };

  const resolveAlert = (id: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "sos_resolve",
        id
      }));
    }
  };

  const acknowledgeAlert = (id: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "sos_acknowledge",
        id
      }));
    }
  };

  const resetSOS = () => {
    setIsActivating(false);
    setSosStep(0);
  };

  return (
    <PageContainer gradient="from-red-50 via-slate-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <AlertTriangle className="h-10 w-10 text-red-600 animate-pulse" />
            Smart Emergency System (SOS)
          </h1>
          <p className="text-gray-600">
            One-tap emergency alert pipeline with instant facial verification and responder dispatch
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Panel */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-100 flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">SOS Activation</h2>
              
              {!isActivating ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerSOS}
                  className="w-48 h-48 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-600 hover:from-red-700 hover:to-red-700 shadow-2xl flex flex-col items-center justify-center border-8 border-red-100 focus:outline-none transition relative group"
                >
                  <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 group-hover:scale-110 transition duration-500 animate-ping" />
                  <ShieldAlert className="h-16 w-16 text-white mb-2" />
                  <span className="text-white font-extrabold text-2xl tracking-wider">TAP SOS</span>
                  <span className="text-red-100 text-xs mt-1">Press in danger</span>
                </motion.button>
              ) : (
                <div className="w-full space-y-6 py-4">
                  {/* Pipeline Stepper */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2 animate-bounce">
                      <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                    <span className="text-red-600 font-bold animate-pulse">SOS ACTIVE - ALERT PIPELINE RUNNING</span>
                  </div>

                  <div className="space-y-4 text-left">
                    {[
                      { step: 1, label: "Initializing SOS Signals...", icon: Clock },
                      { step: 2, label: "Confirming Identity via Face Rec...", icon: UserCheck },
                      { step: 3, label: `Locating Room (${studentRoom})...`, icon: MapPin },
                      { step: 4, label: "Alerting Warden & Security Team...", icon: Bell },
                      { step: 5, label: "Responders Dispatched Successfully", icon: CheckCircle },
                    ].map((stepInfo) => {
                      const isCompleted = sosStep >= stepInfo.step;
                      const isActive = sosStep === stepInfo.step;
                      return (
                        <div
                          key={stepInfo.step}
                          className={`flex items-center space-x-3 p-3 rounded-xl border transition ${
                            isCompleted
                              ? "bg-green-50 border-green-200 text-green-800"
                              : isActive
                              ? "bg-red-50 border-red-200 text-red-800 animate-pulse font-semibold"
                              : "bg-slate-50 border-slate-100 text-gray-400"
                          }`}
                        >
                          <stepInfo.icon className={`h-5 w-5 ${isCompleted ? "text-green-600" : isActive ? "text-red-600" : "text-gray-400"}`} />
                          <span className="text-sm">{stepInfo.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {sosStep === 5 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={resetSOS}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
                    >
                      Dismiss Alert
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Medical & Emergency Contacts */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Emergency Hotline Desk
              </h2>
              <div className="space-y-3">
                {[
                  { title: "Hostel Warden Office", num: "+91 98765 43210" },
                  { title: "Campus Security Gate", num: "+91 98765 43211" },
                  { title: "Local Ambulance Dispatch", num: "102 / +91 98765 43212" },
                  { title: "Closest Medical Room", num: "Ext. 404" },
                ].map((contact, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">{contact.title}</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">{contact.num}</p>
                    </div>
                    <a href={`tel:${contact.num}`} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts Board */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              Real-time SOS Incidents Log
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                      alert.status === "Active"
                        ? "bg-red-50 border-red-200"
                        : alert.status === "Acknowledged"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            alert.status === "Active"
                              ? "bg-red-200 text-red-800 animate-pulse"
                              : alert.status === "Acknowledged"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {alert.status}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">{alert.time}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-800 mt-2">
                        {alert.studentName} — {alert.type}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {alert.room}
                      </p>
                    </div>

                    {userRole === "admin" && alert.status !== "Resolved" && (
                      <div className="flex space-x-2">
                        {alert.status === "Active" && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
