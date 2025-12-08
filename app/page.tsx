"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Building2,
      title: "Facial Recognition",
      description:
        "AI-powered facial recognition for automated attendance and entry/exit tracking",
      color: "from-blue-500 to-cyan-500",
      link: "/dashboard/attendance",
    },
    {
      icon: Users,
      title: "Room Allotment",
      description:
        "Automated room allocation - 2 students per room with same year preference",
      color: "from-purple-500 to-pink-500",
      link: "/dashboard/allotment",
    },
    {
      icon: Shield,
      title: "Mess Management",
      description:
        "Weekly rotation scheduler and automated committee generation",
      color: "from-orange-500 to-red-500",
      link: "/dashboard/mess",
    },
    {
      icon: BarChart3,
      title: "Budget Estimator",
      description:
        "AI-powered electricity & grocery budget prediction and tracking",
      color: "from-green-500 to-teal-500",
      link: "/dashboard/budget",
    },
    {
      icon: Clock,
      title: "Event Management",
      description:
        "Sports leagues with AI captain selection and team formation",
      color: "from-indigo-500 to-blue-500",
      link: "/dashboard/events",
    },
    {
      icon: Bell,
      title: "Leave System",
      description:
        "Digital leave register with approval workflow and notifications",
      color: "from-yellow-500 to-orange-500",
      link: "/dashboard/leave",
    },
  ];

  const stats = [
    { value: "165", label: "Students" },
    { value: "10", label: "Rooms" },
    { value: "95%", label: "Attendance" },
    { value: "24/7", label: "AI Monitoring" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hostel Manager
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
                >
                  Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">
                  Smart Hostel Management
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Hostel Management
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Complete automation with facial recognition, smart room
                allocation, mess management, sports leagues, budget tracking,
                and leave approval system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl border-2 border-gray-200"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your hostel efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="relative group cursor-pointer"
                >
                  <div
                    className={`
                  h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                  transform hover:-translate-y-2 transition-all duration-300
                  ${
                    hoveredFeature === index
                      ? "border-2 border-blue-500"
                      : "border-2 border-transparent"
                  }
                `}
                  >
                    <div
                      className={`
                    w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} 
                    flex items-center justify-center mb-6 group-hover:scale-110 transition-transform
                  `}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                      Explore feature <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Why Choose HostelEase?
              </h2>
              <div className="space-y-4">
                {[
                  "Easy to use interface for students and admins",
                  "Real-time updates and notifications",
                  "Secure data management and privacy",
                  "Mobile-responsive design",
                  "Comprehensive reporting and analytics",
                  "24/7 customer support",
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to get started?
                  </h3>
                  <p className="mb-6 text-blue-100">
                    Join hundreds of hostels already using HostelEase
                  </p>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-6 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl"
                    >
                      Start Free Trial
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">HostelEase</span>
              </div>
              <p className="text-gray-400">
                Smart hostel management made simple
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HostelEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
