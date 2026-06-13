"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Home, Users, CheckCircle, DoorOpen, ClipboardCheck, Sparkles } from "lucide-react";
import { 
  StatCard, 
  RoomCard,
  Button,
  Modal,
  PageContainer
} from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RoomAllotmentPage() {
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAllocating, setIsAllocating] = useState(false);

  // Student questionnaire state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sleep, setSleep] = useState("");
  const [noise, setNoise] = useState("");
  const [hobby, setHobby] = useState("");
  const [cleaning, setCleaning] = useState("");

  const fetchAllotments = async (roleType: "admin" | "student") => {
    setIsLoading(true);
    try {
      if (roleType === "admin") {
        const res = await fetch("/api/allotment");
        const data = await res.json();
        if (res.ok) {
          setRooms(data.rooms || []);
          setStats(data.stats || { total: 0, occupied: 0, available: 0, pending: 0 });
        }
      }
    } catch (e) {
      console.error("Failed to fetch allotments", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = String(user.user_metadata?.role || "student").toLowerCase() as "admin" | "student";
        setUserRole(role);
        void fetchAllotments(role);

        // Fetch student questionnaire completion status from localStorage to persist mock inputs
        const savedPref = localStorage.getItem(`roommate_pref_${user.id}`);
        if (savedPref) {
          setIsSubmitted(true);
          const parsed = JSON.parse(savedPref);
          setSleep(parsed.sleep);
          setNoise(parsed.noise);
          setHobby(parsed.hobby);
          setCleaning(parsed.cleaning);
        }
      }
    };
    void checkUserRole();
  }, []);

  const handleAutoAllocate = async () => {
    setIsAllocating(true);
    try {
      const res = await fetch("/api/allotment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Auto-allocation completed successfully!");
        setShowAllocationModal(false);
        await fetchAllotments("admin");
      } else {
        alert(data.error || "Failed to auto-allocate rooms.");
      }
    } catch {
      alert("Failed to auto-allocate rooms.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleep || !noise || !hobby || !cleaning) {
      alert("Please answer all questionnaire compatibility indicators.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const userRes = await supabase?.auth.getUser();
    if (userRes?.data?.user?.id) {
      const prefData = { sleep, noise, hobby, cleaning };
      localStorage.setItem(`roommate_pref_${userRes.data.user.id}`, JSON.stringify(prefData));
    }
    setIsSubmitted(true);
  };

  const handleEditPreferences = () => {
    setIsSubmitted(false);
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === "all") return true;
    if (filter === "full") return room.status === "full";
    if (filter === "available") return room.status === "available";
    if (filter === "partial") return room.students.length === 1;
    return true;
  });

  return (
    <PageContainer gradient={userRole === "admin" ? "from-purple-50 via-pink-50 to-orange-50" : "from-indigo-50 via-slate-50 to-blue-50"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {userRole === "admin" ? "🏠 Room Allotment System" : "🤝 Roommate Compatibility Form"}
            </h1>
            <p className="text-gray-600">
              {userRole === "admin"
                ? "AI-powered room allocations: 2 students per room, compatibility index matched"
                : "Submit your roommate preferences to find the most compatible roommates"}
            </p>
          </div>
          {userRole === "admin" && (
            <Button
              variant="primary"
              onClick={() => setShowAllocationModal(true)}
            >
              🤖 Auto Allocate
            </Button>
          )}
        </motion.div>

        {userRole === "admin" ? (
          // ================== ADMIN VIEW ==================
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Rooms"
                value={stats.total}
                icon={Home}
                gradient="from-blue-400 to-blue-600"
              />
              <StatCard
                title="Occupied Beds"
                value={stats.occupied}
                icon={Users}
                gradient="from-green-400 to-green-600"
              />
              <StatCard
                title="Available Rooms"
                value={stats.available}
                icon={DoorOpen}
                gradient="from-orange-400 to-orange-600"
              />
              <StatCard
                title="Pending Students"
                value={stats.pending}
                icon={CheckCircle}
                gradient="from-purple-400 to-purple-600"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6">
              {["all", "full", "available", "partial"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all capitalize ${
                    filter === filterOption
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>

            {/* Room Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading allotments database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RoomCard 
                      room={room}
                      onAllocate={() => console.log("Allocate to", room.number)}
                      onViewDetails={() => console.log("View details for", room.number)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {filteredRooms.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No allotments found matching your criteria.
                </p>
              </div>
            )}

            {/* Auto Allocation Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                AI Allocation Criteria
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Same Year Preference
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Algorithm prioritizes matching students from the same academic
                      year for better compatibility
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      2 Students Per Room
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Fixed capacity ensures optimal space utilization and maintains
                      privacy standards
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Smart Matching
                    </h3>
                    <p className="text-gray-600 text-sm">
                      AI considers preferences, behavior patterns, and compatibility
                      scores for optimal pairing
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DoorOpen className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Manual Override
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Administrators can manually adjust allocations based on special
                      requirements
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          // ================== STUDENT VIEW (Questionnaire Form) ==================
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="questionnaire-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <ClipboardCheck className="h-6 w-6 text-indigo-600 animate-pulse" />
                    <h2 className="text-xl font-bold text-gray-800">Roommate Matching Criteria</h2>
                  </div>

                  <form onSubmit={handleQuestionnaireSubmit} className="space-y-6">
                    {/* Sleep Cycle */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">1. What is your typical sleep cycle?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "early", label: "Early Bird (Sleeps by 10 PM)" },
                          { val: "night", label: "Night Owl (Sleeps after midnight)" },
                          { val: "flexible", label: "Flexible / Irregular" },
                        ].map((o) => (
                          <button
                            key={o.val}
                            type="button"
                            onClick={() => setSleep(o.val)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition text-center ${
                              sleep === o.val 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Noise Cycle */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">2. What are your study noise preferences?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "quiet", label: "Strictly Quiet" },
                          { val: "background", label: "Music / Background Noise" },
                          { val: "group", label: "Group / Interactive Study" },
                        ].map((o) => (
                          <button
                            key={o.val}
                            type="button"
                            onClick={() => setNoise(o.val)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition text-center ${
                              noise === o.val 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hobbies */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">3. What is your primary hobby / interest?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "tech", label: "Tech & Coding" },
                          { val: "sports", label: "Sports & Fitness" },
                          { val: "art", label: "Music & Fine Arts" },
                        ].map((o) => (
                          <button
                            key={o.val}
                            type="button"
                            onClick={() => setHobby(o.val)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition text-center ${
                              hobby === o.val 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cleanliness */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">4. Cleanliness & organization preference?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "neat", label: "Extremely Neat" },
                          { val: "average", label: "Average / Relaxed" },
                          { val: "flexible", label: "Flexible / No Preference" },
                        ].map((o) => (
                          <button
                            key={o.val}
                            type="button"
                            onClick={() => setCleaning(o.val)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition text-center ${
                              cleaning === o.val 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button type="submit" variant="primary">
                        🤖 Save Preferences
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="questionnaire-success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 animate-bounce">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Preferences Locked</h2>
                    <p className="text-gray-500 text-sm max-w-md">
                      Your roommate preferences have been successfully uploaded to the matching matrix! The Hostel Allotment Engine will use these values to optimize compatibility ratings.
                    </p>
                  </div>

                  <div className="w-full max-w-md bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-left grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Sleep Cycle</span>
                      <p className="font-bold text-gray-700 capitalize mt-0.5">{sleep}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Noise Preference</span>
                      <p className="font-bold text-gray-700 capitalize mt-0.5">{noise}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Interests</span>
                      <p className="font-bold text-gray-700 capitalize mt-0.5">{hobby}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Cleanliness</span>
                      <p className="font-bold text-gray-700 capitalize mt-0.5">{cleaning}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEditPreferences}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Modify Matching Preferences
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Auto Allocation Modal */}
      {showAllocationModal && (
        <Modal
          isOpen={showAllocationModal}
          onClose={() => setShowAllocationModal(false)}
          title="Auto Room Allocation"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This will automatically allocate all pending students to available
              rooms based on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>Same academic year preference</li>
              <li>2 students per room capacity</li>
              <li>Student questionnaire compatibility matches</li>
              <li>Floor and wing preferences</li>
            </ul>
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleAutoAllocate}
                disabled={isAllocating}
              >
                {isAllocating ? "Processing AI..." : "Start Allocation"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAllocationModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
