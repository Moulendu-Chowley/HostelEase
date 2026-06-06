"use client";

import { CaptainSelection, PointsTable, StatCard } from "@/components";
import { motion } from "framer-motion";
import { Award, Calendar, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const [selectedSport, setSelectedSport] = useState<"football" | "cricket">(
    "football"
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [footballTeams, setFootballTeams] = useState<any[]>([]);
  const [cricketTeams, setCricketTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { title: "Active Leagues", value: "0", icon: Award, gradient: "from-blue-500 to-indigo-600" },
    { title: "Total Teams", value: "0", icon: Users, gradient: "from-green-500 to-emerald-600" },
    { title: "Matches Played", value: "0", icon: TrendingUp, gradient: "from-purple-500 to-pink-600" },
    { title: "Upcoming Matches", value: "0", icon: Calendar, gradient: "from-orange-500 to-red-600" },
  ]);
  const [selectedCaptain, setSelectedCaptain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) {
        setFootballTeams(data.footballTeams || []);
        setCricketTeams(data.cricketTeams || []);
        setMatches(data.matches || []);
        
        if (data.stats) {
          setStats([
            { title: "Active Leagues", value: String(data.stats.activeLeagues), icon: Award, gradient: "from-blue-500 to-indigo-600" },
            { title: "Total Teams", value: String(data.stats.totalTeams), icon: Users, gradient: "from-green-500 to-emerald-600" },
            { title: "Matches Played", value: String(data.stats.matchesPlayed), icon: TrendingUp, gradient: "from-purple-500 to-pink-600" },
            { title: "Upcoming Matches", value: String(data.stats.upcomingMatches), icon: Calendar, gradient: "from-orange-500 to-red-600" },
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch events data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEventsData();
  }, []);

  const handleSelectCaptain = async () => {
    setIsSelecting(true);
    try {
      const res = await fetch("/api/events", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSelectedCaptain(data.captain);
        alert(data.message || "Captain selected successfully!");
      } else {
        alert(data.error || "Failed to select captain.");
      }
    } catch {
      alert("Failed to select captain.");
    } finally {
      setIsSelecting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Award className="text-blue-600" />
            Sports Events & League Management
          </h1>
          <p className="text-gray-600">
            Football and Cricket leagues with AI-powered captain selection
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Sport Selector */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setSelectedSport("football")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedSport === "football"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⚽ Football League
          </button>
          <button
            onClick={() => setSelectedSport("cricket")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedSport === "cricket"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🏏 Cricket League
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Points Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PointsTable
              teams={
                selectedSport === "football" ? footballTeams : cricketTeams
              }
              tournamentName={
                selectedSport === "football"
                  ? "Football League 2024"
                  : "Cricket League 2024"
              }
            />
          </motion.div>

          {/* Captain Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CaptainSelection
              onSelect={handleSelectCaptain}
              isSelecting={isSelecting}
              selectedCaptain={selectedCaptain}
            />
          </motion.div>
        </div>

        {/* Upcoming Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Upcoming Matches
          </h2>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming fixtures scheduled.</p>
            ) : (
              matches.map((match, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{match.team1}</p>
                      <p className="text-xs text-gray-500">vs</p>
                      <p className="font-semibold text-gray-800">{match.team2}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-700">{match.date}</p>
                    <p className="text-sm text-gray-600">
                      {match.time} • {match.venue}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            League Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Points System
                </h3>
                <p className="text-gray-600 text-sm">
                  Win: 3 points • Draw: 1 point • Loss: 0 points with goal
                  difference tracking
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  AI Captain Selection
                </h3>
                <p className="text-gray-600 text-sm">
                  ML algorithm analyzes performance, leadership, and team stats
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Performance Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Track individual and team statistics with detailed insights
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Automated Scheduling
                </h3>
                <p className="text-gray-600 text-sm">
                  Smart scheduling ensures fair match distribution and venue
                  availability
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
