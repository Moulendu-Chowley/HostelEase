"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Bed,
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview", href: "/dashboard" },
    {
      id: "attendance",
      icon: UserCheck,
      label: "Attendance",
      href: "/dashboard/attendance",
    },
    { id: "rooms", icon: Building2, label: "Rooms", href: "/dashboard/rooms" },
    {
      id: "allotment",
      icon: Bed,
      label: "Room Allotment",
      href: "/dashboard/allotment",
    },
    {
      id: "students",
      icon: Users,
      label: "Students",
      href: "/dashboard/students",
    },
    {
      id: "mess",
      icon: Calendar,
      label: "Mess Management",
      href: "/dashboard/mess",
    },
    {
      id: "events",
      icon: TrendingUp,
      label: "Events & Sports",
      href: "/dashboard/events",
    },
    {
      id: "budget",
      icon: FileText,
      label: "Budget",
      href: "/dashboard/budget",
    },
    {
      id: "leave",
      icon: ClipboardList,
      label: "Leave Management",
      href: "/dashboard/leave",
    },
    {
      id: "complaints",
      icon: AlertCircle,
      label: "Complaints",
      href: "/dashboard/complaints",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white shadow-xl z-40 border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HostelEase
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <button
                        className={`
                          w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                          ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "text-gray-600 hover:bg-gray-100"
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div
              className={`flex items-center ${
                sidebarOpen ? "space-x-3" : "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">admin@hostel.com</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
        className="transition-all duration-300"
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, Admin!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                  Home
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </motion.main>
    </div>
  );
}
