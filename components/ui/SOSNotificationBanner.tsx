"use client";

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, ShieldAlert, X, Shield, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SOSAlert {
  id: string;
  studentName: string;
  room: string;
  time: string;
  status: "Active" | "Acknowledged" | "Resolved";
  type: string;
}

export default function SOSNotificationBanner() {
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Sync user role
  useEffect(() => {
    const syncUser = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = String(user.user_metadata?.role || "student").toLowerCase();
        setUserRole(role === "admin" ? "admin" : "student");
      }
    };
    void syncUser();
  }, []);

  // Establish WebSocket connection with auto-reconnect
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    
    const connect = () => {
      const rawUrl = process.env.NEXT_PUBLIC_DEEPFACE_SERVICE_URL || "http://localhost:8000";
      const wsUrl = rawUrl.replace(/^http/, "ws") + "/ws/sos";

      console.log(`Connecting to SOS WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("SOS WebSocket connected");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("SOS WebSocket message received:", message);

          switch (message.type) {
            case "sos_initial_state":
              // Load active alerts that are not resolved, or keep all
              setActiveAlerts(message.alerts.filter((a: SOSAlert) => a.status !== "Resolved"));
              break;

            case "sos_alert":
              // Prepend the new alert
              setActiveAlerts((prev) => {
                const exists = prev.some((a) => a.id === message.alert.id);
                if (exists) return prev;
                return [message.alert, ...prev];
              });
              // Try to play emergency beep sound
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.3);
              } catch (e) {
                console.log("Audio play failed or blocked", e);
              }
              break;

            case "sos_acknowledge":
              setActiveAlerts((prev) =>
                prev.map((alert) =>
                  alert.id === message.id ? { ...alert, status: "Acknowledged" as const } : alert
                )
              );
              break;

            case "sos_resolve":
              // Remove resolved alerts from the active list or mark resolved
              setActiveAlerts((prev) =>
                prev.map((alert) =>
                  alert.id === message.id ? { ...alert, status: "Resolved" as const } : alert
                ).filter((alert) => alert.status !== "Resolved")
              );
              break;

            case "sos_dismiss":
              setActiveAlerts((prev) => prev.filter((alert) => alert.id !== message.id));
              break;
          }
        } catch (err) {
          console.error("Error parsing socket message", err);
        }
      };

      socket.onclose = () => {
        console.log("SOS WebSocket disconnected. Reconnecting in 5 seconds...");
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (error) => {
        console.error("SOS WebSocket error:", error);
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

  const sendAction = (type: string, id: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, id }));
    }
  };

  const handleAcknowledge = (id: string) => {
    sendAction("sos_acknowledge", id);
  };

  const handleResolve = (id: string) => {
    sendAction("sos_resolve", id);
  };

  const handleDismiss = (id: string) => {
    // If it's a student, they can dismiss the alert from their local view
    setActiveAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // We only care about active/acknowledged alerts
  const displayAlerts = activeAlerts.filter((a) => a.status !== "Resolved");

  if (displayAlerts.length === 0) return null;

  // Render the highest priority alert (first one)
  const currentAlert = displayAlerts[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 sm:px-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAlert.id}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative rounded-3xl p-5 shadow-2xl border backdrop-blur-md flex flex-col gap-4 overflow-hidden ${
            currentAlert.status === "Active"
              ? "bg-red-600/95 border-red-500 text-white animate-pulse shadow-red-600/50"
              : "bg-amber-600/95 border-amber-500 text-white shadow-amber-600/50"
          }`}
        >
          {/* Custom blinking background animation effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-wide flex items-center gap-2">
                  <span>EMERGENCY SOS</span>
                  <span className="text-xs px-2 py-0.5 bg-white/30 rounded-full font-bold uppercase tracking-wider">
                    {currentAlert.status}
                  </span>
                </h3>
                <p className="text-xs text-white/80 font-medium">Real-time Safety Alert</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(currentAlert.id)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5 text-white/80 hover:text-white" />
            </button>
          </div>

          {/* Details */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
            <p className="text-sm font-semibold text-white/90">
              Triggered by: <span className="font-extrabold text-white">{currentAlert.studentName}</span>
            </p>
            <p className="text-sm font-semibold text-white/90 mt-1">
              Location: <span className="font-extrabold text-white">{currentAlert.room}</span>
            </p>
            <p className="text-xs text-white/70 mt-2 italic">
              Please take immediate action. Move out or proceed to help if safe.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <Link
              href="/dashboard/emergency"
              className="flex items-center gap-1 text-xs text-white/90 hover:text-white underline font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Emergency Console
            </Link>

            {userRole === "admin" ? (
              <div className="flex gap-2">
                {currentAlert.status === "Active" && (
                  <button
                    onClick={() => handleAcknowledge(currentAlert.id)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-md border border-amber-500"
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => handleResolve(currentAlert.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md border border-emerald-500"
                >
                  Resolve
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-white/80 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-white/90" />
                Warden Alerted
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
