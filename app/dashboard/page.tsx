"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export default function DashboardOverview() {
  const stats = [
    {
      title: "Total Students",
      value: "165",
      change: "+12%",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      trend: "up",
    },
    {
      title: "Present Today",
      value: "142",
      change: "+5",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
      trend: "up",
    },
    {
      title: "Pending Leaves",
      value: "3",
      change: "+2",
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
      trend: "up",
    },
    {
      title: "Events This Week",
      value: "5",
      change: "+1",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      trend: "up",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "check-in",
      user: "John Doe",
      action: "Checked in to Room 101",
      time: "5 min ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 2,
      type: "complaint",
      user: "Jane Smith",
      action: "Submitted maintenance complaint",
      time: "12 min ago",
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      id: 3,
      type: "visitor",
      user: "Mike Johnson",
      action: "Visitor registered",
      time: "1 hour ago",
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      id: 4,
      type: "room",
      user: "Admin",
      action: "Room 205 marked for cleaning",
      time: "2 hours ago",
      icon: Building2,
      color: "text-purple-500",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Room Inspection",
      date: "Dec 10, 2025",
      time: "10:00 AM",
      type: "inspection",
    },
    {
      id: 2,
      title: "Hostel Meeting",
      date: "Dec 12, 2025",
      time: "3:00 PM",
      type: "meeting",
    },
    {
      id: 3,
      title: "Maintenance Schedule",
      date: "Dec 15, 2025",
      time: "9:00 AM",
      type: "maintenance",
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-sm font-semibold ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`p-3 rounded-full bg-gray-100 ${activity.color}`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{event.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Add Student",
              icon: Users,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "Assign Room",
              icon: Building2,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Log Visitor",
              icon: UserCheck,
              color: "from-green-500 to-teal-500",
            },
            {
              label: "Generate Report",
              icon: FileText,
              color: "from-orange-500 to-red-500",
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl flex flex-col items-center space-y-2`}
            >
              <action.icon className="h-8 w-8" />
              <span className="font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
