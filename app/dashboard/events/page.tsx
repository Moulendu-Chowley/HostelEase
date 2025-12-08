"use client";

import { CaptainSelection, PointsTable, StatCard } from "@/components";
import { motion } from "framer-motion";
import { Award, Calendar, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export default function EventsPage() {
  const [selectedSport, setSelectedSport] = useState<"football" | "cricket">(
    "football"
  );
  const [isSelecting, setIsSelecting] = useState(false);

  const stats = [
    {
      title: "Active Leagues",
      value: "2",
      icon: Award,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Total Teams",
      value: "8",
      icon: Users,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Matches Played",
      value: "24",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Upcoming Matches",
      value: "12",
      icon: Calendar,
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const footballTeams = [
    {
      id: 1,
      name: "Thunder FC",
      captain: "Rahul Sharma",
      wins: 5,
      losses: 1,
      points: 15,
    },
    {
      id: 2,
      name: "Phoenix United",
      captain: "Amit Kumar",
      wins: 4,
      losses: 2,
      points: 12,
    },
    {
      id: 3,
      name: "Warriors XI",
      captain: "Karthik Reddy",
      wins: 3,
      losses: 3,
      points: 9,
    },
    {
      id: 4,
      name: "Eagles FC",
      captain: "Sanjay Patel",
      wins: 0,
      losses: 6,
      points: 0,
    },
  ];

  const cricketTeams = [
    {
      id: 1,
      name: "Royal Strikers",
      captain: "Priya Singh",
      wins: 6,
      losses: 0,
      points: 18,
    },
    {
      id: 2,
      name: "Super Kings",
      captain: "Sneha Patel",
      wins: 4,
      losses: 2,
      points: 12,
    },
    {
      id: 3,
      name: "Knight Riders",
      captain: "Arun Verma",
      wins: 2,
      losses: 4,
      points: 6,
    },
    {
      id: 4,
      name: "Challengers",
      captain: "Ravi Gupta",
      wins: 0,
      losses: 6,
      points: 0,
    },
  ];

  const handleSelectCaptain = () => {
    setIsSelecting(true);
    setTimeout(() => {
      setIsSelecting(false);
    }, 2000);
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
            {[
              {
                team1: "Warriors",
                team2: "Titans",
                date: "Dec 10, 2025",
                time: "4:00 PM",
                venue: "Ground A",
              },
              {
                team1: "Spartans",
                team2: "Phoenix",
                date: "Dec 11, 2025",
                time: "5:00 PM",
                venue: "Ground B",
              },
              {
                team1: "Warriors",
                team2: "Phoenix",
                date: "Dec 13, 2025",
                time: "4:00 PM",
                venue: "Ground A",
              },
              {
                team1: "Titans",
                team2: "Spartans",
                date: "Dec 14, 2025",
                time: "5:00 PM",
                venue: "Ground B",
              },
            ].map((match, index) => (
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
            ))}
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
