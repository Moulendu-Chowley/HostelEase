"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { 
  StatCard, 
  MessSchedule,
  MessCommittee,
  Button,
  PageContainer
} from "@/components";

export default function MessManagementPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = {
    totalStudents: 160,
    activeCommittee: 5,
    weeksRotated: 12,
    avgResponseTime: "2.5h",
  };

  const schedule = [
    { day: "Monday", meal: "Breakfast", menu: "Idli, Sambar, Chutney", committee: "Team A" },
    { day: "Monday", meal: "Lunch", menu: "Rice, Dal, Sabzi, Roti", committee: "Team A" },
    { day: "Monday", meal: "Dinner", menu: "Chapati, Paneer, Rice", committee: "Team A" },
    { day: "Tuesday", meal: "Breakfast", menu: "Poha, Chai", committee: "Team B" },
    { day: "Tuesday", meal: "Lunch", menu: "Chole, Rice, Roti", committee: "Team B" },
    { day: "Tuesday", meal: "Dinner", menu: "Dal Fry, Rice, Roti", committee: "Team B" },
    { day: "Wednesday", meal: "Breakfast", menu: "Upma, Coffee", committee: "Team A" },
  ];

  const members = [
    { id: 1, name: "Rahul Sharma", role: "Head", year: "3rd Year", rollNo: "HS2021001" },
    { id: 2, name: "Priya Singh", role: "Deputy", year: "2nd Year", rollNo: "HS2022015" },
    { id: 3, name: "Amit Kumar", role: "Member", year: "1st Year", rollNo: "HS2023032" },
    { id: 4, name: "Sneha Patel", role: "Member", year: "3rd Year", rollNo: "HS2021045" },
    { id: 5, name: "Vikram Reddy", role: "Member", year: "2nd Year", rollNo: "HS2022078" },
  ];

  const handleGenerateCommittee = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("New committee generated successfully!");
    }, 1500);
  };

  return (
    <PageContainer gradient="from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍽️ Mess Management System
          </h1>
          <p className="text-gray-600">
            Weekly rotation schedule with automated committee (5 members)
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Active Committee"
            value={stats.activeCommittee}
            icon={CheckCircle}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            title="Weeks Rotated"
            value={stats.weeksRotated}
            icon={Calendar}
            gradient="from-purple-400 to-purple-600"
          />
          <StatCard
            title="Avg Response Time"
            value={stats.avgResponseTime}
            icon={Clock}
            gradient="from-orange-400 to-orange-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Schedule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MessSchedule
              schedule={schedule}
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />
          </motion.div>

          {/* Committee Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MessCommittee
              members={members}
              onGenerate={handleGenerateCommittee}
              isGenerating={isGenerating}
            />
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Weekly Rotation</h3>
                <p className="text-gray-600 text-sm">
                  Automated 7-day mess duty schedule with fair distribution across all students
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Committee of 5</h3>
                <p className="text-gray-600 text-sm">
                  Auto-generated committee of 5 students selected fairly across different years
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Menu Planning</h3>
                <p className="text-gray-600 text-sm">
                  Weekly menu planning with student feedback and dietary preferences considered
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Quick Resolution</h3>
                <p className="text-gray-600 text-sm">
                  Track and resolve mess-related complaints with average 2.5h response time
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
