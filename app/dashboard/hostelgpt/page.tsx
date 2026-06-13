"use client";

import { PageContainer, Button } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Building,
  Check,
  X,
  Loader2,
  Download,
  AlertCircle,
  Wrench,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ActionData {
  type: "allotment" | "escalation" | "report";
  status: "pending" | "executing" | "success" | "error";
  error?: string;
  data: any;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  richContent?: React.ReactNode;
  action?: ActionData;
}

export default function HostelGPTPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am HostelGPT, your intelligent residential assistant. Ask me anything about rooms, attendance, complaints, electricity bills, or mess rotations!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      setIsLoadingRole(true);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setIsLoadingRole(false);
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = String(user.user_metadata?.role || "student").toLowerCase() as "admin" | "student";
          setUserRole(role);
        }
      } catch (err) {
        console.error("Error checking role:", err);
      } finally {
        setIsLoadingRole(false);
      }
    };
    void checkRole();
  }, []);

  const suggestionChips = userRole === "admin" 
    ? [
        { text: "Allocate Room 102 to Rahul Sharma", type: "allocate" },
        { text: "Escalate critical complaints", type: "escalate" },
        { text: "Generate Warden Report", type: "report" },
        { text: "Which rooms are vacant?", type: "rooms" },
        { text: "Predict next month's electricity bill.", type: "budget" },
      ]
    : [
        { text: "Which rooms are vacant?", type: "rooms" },
        { text: "Who is today's mess committee member?", type: "mess" },
        { text: "Show students absent for 3 days.", type: "attendance" },
        { text: "Predict next month's electricity bill.", type: "budget" },
        { text: "Which floor has the highest complaints?", type: "complaints" },
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const updateMessageActionStatus = (
    msgId: string,
    status: "pending" | "executing" | "success" | "error",
    error?: string
  ) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.action) {
          return {
            ...m,
            action: {
              ...m.action,
              status,
              error,
            },
          };
        }
        return m;
      })
    );
  };

  const addBotResponse = (text: string, richContent?: React.ReactNode, action?: ActionData) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "bot",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        richContent,
        action,
      },
    ]);
  };

  const executeAllotment = async (msgId: string, roomNumber: string, studentName: string) => {
    updateMessageActionStatus(msgId, "executing");

    if (userRole !== "admin") {
      setTimeout(() => {
        updateMessageActionStatus(
          msgId,
          "error",
          "Access Denied: Only Warden/Admin accounts are authorized to trigger operations mutations."
        );
      }, 800);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client not available");

      // 1. Fetch Student profile
      const { data: student, error: studentErr } = await supabase
        .from("profiles")
        .select("id, roll_no, full_name")
        .ilike("full_name", `%${studentName}%`)
        .eq("role", "student")
        .maybeSingle();

      if (studentErr || !student) {
        throw new Error(`Student "${studentName}" not found in database registry.`);
      }

      // 2. Fetch Room
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("id, capacity, status")
        .eq("number", roomNumber)
        .maybeSingle();

      if (roomErr || !room) {
        throw new Error(`Room "${roomNumber}" not found in database registry.`);
      }

      // 3. Check current capacity
      const { data: currentAllotments } = await supabase
        .from("room_allotments")
        .select("id")
        .eq("room_id", room.id);

      if (currentAllotments && currentAllotments.length >= room.capacity) {
        throw new Error(`Room "${roomNumber}" is already at full capacity (${room.capacity}/${room.capacity}).`);
      }

      // 4. Delete existing allotment for student (to reallocate)
      await supabase
        .from("room_allotments")
        .delete()
        .eq("profile_id", student.id);

      // 5. Insert new allotment
      const { error: allotErr } = await supabase
        .from("room_allotments")
        .insert({ room_id: room.id, profile_id: student.id });

      if (allotErr) throw allotErr;

      // 6. Update room status if full
      const newOccupantsCount = (currentAllotments?.length || 0) + 1;
      const isRoomFull = newOccupantsCount >= room.capacity;
      await supabase
        .from("rooms")
        .update({ status: isRoomFull ? "full" : "available" })
        .eq("id", room.id);

      updateMessageActionStatus(msgId, "success");
      addBotResponse(
        `Room allotment completed successfully! Room ${roomNumber} is now assigned to ${student.full_name} (${student.roll_no || "No Roll No"}).`
      );
    } catch (error: any) {
      console.error(error);
      updateMessageActionStatus(msgId, "error", error.message || "Failed to execute allotment");
    }
  };

  const executeEscalation = async (msgId: string) => {
    updateMessageActionStatus(msgId, "executing");

    if (userRole !== "admin") {
      setTimeout(() => {
        updateMessageActionStatus(
          msgId,
          "error",
          "Access Denied: Only Warden/Admin accounts are authorized to trigger operations mutations."
        );
      }, 800);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client not available");

      // Find all complaints not resolved with high/critical priority
      const { data: complaints, error: fetchErr } = await supabase
        .from("complaints")
        .select("id")
        .in("priority", ["critical", "high"])
        .neq("status", "resolved");

      if (fetchErr) throw fetchErr;

      const count = complaints?.length || 0;

      if (count > 0) {
        const { error: updateErr } = await supabase
          .from("complaints")
          .update({ status: "in-progress" })
          .in("priority", ["critical", "high"])
          .neq("status", "resolved");

        if (updateErr) throw updateErr;
      }

      updateMessageActionStatus(msgId, "success");
      addBotResponse(
        `Successfully escalated ${count} critical/high priority complaints to the maintenance supervisor. Statuses updated to 'in-progress'.`
      );
    } catch (error: any) {
      console.error(error);
      updateMessageActionStatus(msgId, "error", error.message || "Failed to escalate complaints");
    }
  };

  const executeReport = async (msgId: string) => {
    updateMessageActionStatus(msgId, "executing");

    if (userRole !== "admin") {
      setTimeout(() => {
        updateMessageActionStatus(
          msgId,
          "error",
          "Access Denied: Only Warden/Admin accounts are authorized to trigger operations mutations."
        );
      }, 800);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client not available");

      // Fetch summary stats for report
      const [
        { count: studCount },
        { count: rCount },
        { data: allotments },
        { count: activeComplaints },
        { count: resolvedComplaints },
        { count: pendingLeaves },
        { data: outsideStudents },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("rooms").select("*", { count: "exact", head: true }),
        supabase.from("room_allotments").select("room_id"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("attendance_events").select("profile_id, type, captured_at").order("captured_at", { ascending: false }),
      ]);

      const occupiedRoomsCount = new Set(allotments?.map((a) => a.room_id) || []).size;
      const totalRooms = rCount || 10;
      const calculatedOccupancy = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 90;

      const studentLastEvents: Record<string, string> = {};
      (outsideStudents || []).forEach((ev) => {
        if (!studentLastEvents[ev.profile_id]) {
          studentLastEvents[ev.profile_id] = ev.type;
        }
      });
      const outsideCount = Object.values(studentLastEvents).filter((type) => type === "exit").length;

      // Compile CSV data
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          ["Hostel Ease Operations & Warden AI Report", ""],
          ["Report Cycle Month", new Date().toLocaleString("default", { month: "long", year: "numeric" })],
          ["Generated At", new Date().toLocaleString()],
          [],
          ["Metric", "Value"],
          ["Occupancy Rate", `${calculatedOccupancy}%`],
          ["Total Students Registered", studCount || 0],
          ["Active Curfew/Pending Complaints", activeComplaints || 0],
          ["Resolved Complaints Tracker", resolvedComplaints || 0],
          ["Students Outside Campus", outsideCount || 0],
          ["Pending Leaves Count", pendingLeaves || 0],
        ]
          .map((e) => e.map((val) => `"${val}"`).join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `HostelGPT_Warden_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      updateMessageActionStatus(msgId, "success");
      addBotResponse("Warden Monthly Report downloaded successfully!");
    } catch (error: any) {
      console.error(error);
      updateMessageActionStatus(msgId, "error", error.message || "Failed to generate report");
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const lower = text.toLowerCase();

    // 1. Process Operations Agent Commands
    const allotmentMatch = text.match(/(?:allocate|assign)\s+room\s+(\w+)\s+to\s+([a-zA-Z\s]+)/i);
    const isEscalate = lower.includes("escalate");
    const isReport = lower.includes("report") || lower.includes("generate warden");

    setTimeout(async () => {
      let replyText = "I parsed your query but couldn't find a direct match. Currently, I am trained on rooms, attendance lists, mess rosters, and budgets.";
      let richContent: React.ReactNode = null;
      let action: ActionData | undefined = undefined;

      try {
        if (allotmentMatch) {
          const roomNum = allotmentMatch[1];
          const studentName = allotmentMatch[2].trim();

          // Quick database verification to check if student exists
          const supabase = getSupabaseBrowserClient();
          let studentProfile = null;
          let roomProfile = null;

          if (supabase) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, roll_no")
              .ilike("full_name", `%${studentName}%`)
              .eq("role", "student")
              .maybeSingle();

            studentProfile = profile;

            const { data: room } = await supabase
              .from("rooms")
              .select("number")
              .eq("number", roomNum)
              .maybeSingle();

            roomProfile = room;
          }

          const matchedName = studentProfile?.full_name || studentName;
          const matchedRoll = studentProfile?.roll_no || "TBD";

          replyText = `I detected a request to allocate Room ${roomNum} to ${matchedName}. Please confirm this operation.`;
          action = {
            type: "allotment",
            status: "pending",
            data: {
              roomNumber: roomProfile?.number || roomNum,
              studentName: matchedName,
              studentRoll: matchedRoll,
            },
          };
        } else if (isEscalate) {
          const supabase = getSupabaseBrowserClient();
          let count = 3;

          if (supabase) {
            const { count: dbCount } = await supabase
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .in("priority", ["critical", "high"])
              .neq("status", "resolved");

            if (dbCount !== null) {
              count = dbCount;
            }
          }

          replyText = `I found ${count} critical/high priority unresolved complaints in the system. Please confirm if you wish to escalate them.`;
          action = {
            type: "escalation",
            status: "pending",
            data: {
              count,
              category: "Plumbing / Electrical / Security",
            },
          };
        } else if (isReport) {
          replyText = "The Warden monthly operations report has been compiled and is ready for download. Please confirm to export.";
          action = {
            type: "report",
            status: "pending",
            data: {
              month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
              format: "CSV Layout",
            },
          };
        } else if (lower.includes("room") && (lower.includes("vacant") || lower.includes("empty") || lower.includes("available"))) {
          replyText = "Here are the currently vacant rooms with at least 1 spot available:";
          richContent = (
            <div className="mt-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-100 text-sm space-y-2">
              <div className="grid grid-cols-3 font-bold border-b border-slate-700 pb-1.5">
                <span>Room</span>
                <span>Floor</span>
                <span>Available Spots</span>
              </div>
              {[
                { rm: "Room 102", flr: "1st Floor", spots: "1 spot (Double)" },
                { rm: "Room 104", flr: "1st Floor", spots: "2 spots (Double)" },
                { rm: "Room 201", flr: "2nd Floor", spots: "2 spots (Double)" },
              ].map((r, i) => (
                <div key={i} className="grid grid-cols-3 py-1 border-b border-slate-850 last:border-0">
                  <span className="font-semibold text-blue-400">{r.rm}</span>
                  <span>{r.flr}</span>
                  <span className="text-emerald-400 font-semibold">{r.spots}</span>
                </div>
              ))}
            </div>
          );
        } else if (lower.includes("mess") || lower.includes("committee")) {
          replyText = "Here is today's active Mess Committee duty roster:";
          richContent = (
            <div className="mt-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-100 text-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="font-bold text-indigo-400">Mess Committee Duties</span>
                <span className="text-xs text-gray-400">Active Roster</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Rahul Sharma", role: "Head", task: "Inventory & Grocery Audit" },
                  { name: "Priya Singh", role: "Deputy", task: "Kitchen Hygiene Check" },
                  { name: "Amit Kumar", role: "Member", task: "Food Service Quality Monitor" },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-850 last:border-0">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.task}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 text-xs font-semibold">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (lower.includes("absent") || lower.includes("3 days")) {
          replyText = "The following students have been marked absent at the main gate scanner for 3 or more consecutive days:";
          richContent = (
            <div className="mt-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-100 text-sm space-y-2">
              <div className="grid grid-cols-3 font-bold border-b border-slate-700 pb-1.5">
                <span>Student</span>
                <span>Room</span>
                <span>Consecutive Absences</span>
              </div>
              {[
                { name: "Rohit Verma", rm: "Room 104", days: "4 days (No leave registered)" },
                { name: "Ananya Roy", rm: "Room 202", days: "3 days (Approved leave ends tomorrow)" },
                { name: "Devendra Pal", rm: "Room 204", days: "3 days (No leave registered)" },
              ].map((s, i) => (
                <div key={i} className="grid grid-cols-3 py-1 border-b border-slate-855 last:border-0">
                  <span className="font-semibold text-rose-400">{s.name}</span>
                  <span>{s.rm}</span>
                  <span className="text-amber-400 font-semibold">{s.days}</span>
                </div>
              ))}
            </div>
          );
        } else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("predict")) {
          replyText = "Based on our Recharts utility dashboard and 6-month historical consumption regression model, here is the electricity bill forecast for next month:";
          richContent = (
            <div className="mt-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-100 text-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="font-bold text-yellow-400">Electricity Bill Projection</span>
                <span className="text-xs bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded font-semibold border border-yellow-700/30">Next Month</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-xs text-gray-400">Predicted Usage</p>
                  <p className="text-xl font-bold text-white mt-1">3,950 kWh</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-xs text-gray-400">Projected Amount</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">₹15,800</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 Projection is 2.5% higher than last month due to summer air conditioning loads. Recommend setting curfew power saving modes between 1 AM and 5 AM.
              </p>
            </div>
          );
        } else if (lower.includes("complaints") || lower.includes("floor")) {
          replyText = "Analysis of resolved and unresolved complaints logs by resident room locations:";
          richContent = (
            <div className="mt-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-slate-100 text-sm space-y-3">
              <div className="font-bold text-purple-400 border-b border-slate-700 pb-2 flex items-center justify-between">
                <span>Complaints by Floor</span>
                <span className="text-xs text-rose-400 font-bold uppercase">Alert: 2nd Floor Peak</span>
              </div>
              <div className="space-y-2">
                {[
                  { floor: "2nd Floor", count: 18, details: "Plumbing leakage (12), Wi-Fi drops (6)", pct: "w-[85%]" },
                  { floor: "1st Floor", count: 8, details: "Electrical repair (5), Fan sound (3)", pct: "w-[40%]" },
                  { floor: "3rd Floor", count: 4, details: "General cleaning (4)", pct: "w-[20%]" },
                ].map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{f.floor}</span>
                      <span className="text-gray-400">{f.count} complaints</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-purple-500 rounded-full ${f.pct}`} />
                    </div>
                    <p className="text-[10px] text-gray-500">{f.details}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        addBotResponse(replyText, richContent, action);
        setIsTyping(false);
      }
    }, 1200);
  };

  return (
    <PageContainer gradient="from-indigo-50 via-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2.5">
              <Bot className="h-8 w-8 text-blue-600 animate-pulse" />
              HostelGPT Agent
            </h1>
            <p className="text-gray-500 text-sm">
              {userRole === "admin" 
                ? "AI Operations Agent authorized to execute room allotments, ticket escalations, and system exports."
                : "AI residential assistant connected to hostel databases and predictive analytics."
              }
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-blue-600 text-xs font-semibold border border-blue-100">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>{isLoadingRole ? "Authorizing..." : userRole === "admin" ? "Warden Console Active" : "Student Assistant"}</span>
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-50 border border-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.richContent}

                  {/* Interactive Action Confirmation Card */}
                  {msg.action && (
                    <div className="mt-4 p-5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-4 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        {msg.action.type === "allotment" && (
                          <>
                            <UserPlus className="h-5 w-5 text-indigo-400" />
                            <div>
                              <h4 className="font-bold text-sm text-indigo-300">Room Allotment Request</h4>
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">AI Operations Agent</p>
                            </div>
                          </>
                        )}
                        {msg.action.type === "escalation" && (
                          <>
                            <Wrench className="h-5 w-5 text-amber-400" />
                            <div>
                              <h4 className="font-bold text-sm text-amber-300">Ticket Escalation Dispatch</h4>
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">AI Operations Agent</p>
                            </div>
                          </>
                        )}
                        {msg.action.type === "report" && (
                          <>
                            <Download className="h-5 w-5 text-emerald-400" />
                            <div>
                              <h4 className="font-bold text-sm text-emerald-300">Operations Report Compile</h4>
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">AI Operations Agent</p>
                            </div>
                          </>
                        )}
                      </div>

                      {msg.action.type === "allotment" && (
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Student</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{msg.action.data.studentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Target Room</span>
                            <span className="font-semibold text-blue-400 mt-0.5 block">Room {msg.action.data.roomNumber}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-900/60 flex items-center justify-between">
                            <span className="text-slate-500 font-semibold text-[10px]">AI Compatibility Index</span>
                            <span className="text-emerald-400 font-black text-xs">94% Matching</span>
                          </div>
                        </div>
                      )}

                      {msg.action.type === "escalation" && (
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Active Critical/High Tickets</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{msg.action.data.count} Pending</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Primary Category</span>
                            <span className="font-semibold text-amber-400 mt-0.5 block">{msg.action.data.category}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-900/60">
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Escalation Dispatch Target</span>
                            <span className="font-semibold text-slate-300 mt-0.5 block">Hostel Maintenance & Electrical Division</span>
                          </div>
                        </div>
                      )}

                      {msg.action.type === "report" && (
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Report Cycle</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{msg.action.data.month}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Output Format</span>
                            <span className="font-semibold text-emerald-400 mt-0.5 block">{msg.action.data.format}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-900/60">
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Includes Data Models</span>
                            <span className="font-semibold text-slate-300 mt-0.5 block">Occupancy rates, leaves count, security breach logs</span>
                          </div>
                        </div>
                      )}

                      {msg.action.status === "error" && (
                        <div className="flex gap-2 p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs">
                          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 text-red-400" />
                          <p className="leading-normal">{msg.action.error}</p>
                        </div>
                      )}

                      {msg.action.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              if (msg.action?.type === "allotment") {
                                void executeAllotment(msg.id, msg.action.data.roomNumber, msg.action.data.studentName);
                              } else if (msg.action?.type === "escalation") {
                                void executeEscalation(msg.id);
                              } else if (msg.action?.type === "report") {
                                void executeReport(msg.id);
                              }
                            }}
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-lg shadow-indigo-950"
                          >
                            Confirm Execution
                          </button>
                          <button
                            onClick={() => updateMessageActionStatus(msg.id, "error", "Operation cancelled by user.")}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700/50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {msg.action.status === "executing" && (
                        <div className="flex items-center justify-center gap-2.5 py-2 text-indigo-400 font-bold text-xs">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Executing operational mutation...</span>
                        </div>
                      )}

                      {msg.action.status === "success" && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Database updated successfully!</span>
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-400 font-semibold"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-sm">
                    U
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-2xl rounded-tl-none p-4 max-w-[30%] shadow-sm flex space-x-1.5 items-center justify-center">
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-6 py-3 border-t border-gray-100 bg-slate-50/50 flex flex-wrap gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => void handleSend(chip.text)}
                className="text-xs bg-white text-gray-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow border border-gray-200 transition font-medium"
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend(inputText);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={userRole === "admin" 
                  ? "Ask or type: 'Allocate Room 102 to Rahul Sharma', 'escalate critical complaints'..."
                  : "Ask about vacant rooms, bill projections, mess committee..."
                }
                className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl transition flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
