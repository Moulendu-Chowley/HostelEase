"use client";

import {
  BudgetStatBox,
  ElectricityChart,
  GroceryChart,
  StatCard,
} from "@/components";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

export default function BudgetPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const stats = [
    {
      title: "Total Budget",
      value: "₹45,000",
      icon: DollarSign,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Electricity Cost",
      value: "₹28,500",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      title: "Grocery Expenses",
      value: "₹16,500",
      icon: ShoppingCart,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Predicted Next Month",
      value: "₹47,200",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  const electricityData = [
    { month: "Jul", units: 4200, cost: 24200 },
    { month: "Aug", units: 4500, cost: 25800 },
    { month: "Sep", units: 4300, cost: 24500 },
    { month: "Oct", units: 4450, cost: 25200 },
    { month: "Nov", units: 4700, cost: 26800 },
    { month: "Dec", units: 5000, cost: 28500 },
  ];

  const groceryData = [
    { category: "Vegetables", amount: 5200 },
    { category: "Rice/Grains", amount: 3800 },
    { category: "Dairy", amount: 2900 },
    { category: "Spices", amount: 1500 },
    { category: "Oil", amount: 1800 },
    { category: "Others", amount: 1300 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <DollarSign className="text-yellow-600" />
              Budget Tracker & AI Estimator
            </h1>
            <p className="text-gray-600">
              Track electricity and grocery expenses with AI-powered predictions
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
            {(["month", "quarter", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  period === p
                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Electricity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ElectricityChart data={electricityData} />
          </motion.div>

          {/* Grocery Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GroceryChart data={groceryData} />
          </motion.div>
        </div>

        {/* Budget Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <BudgetStatBox
            title="Electricity per Student"
            value="₹178"
            subtitle="+₹15 from last month"
            gradient="from-yellow-500 to-orange-600"
          />
          <BudgetStatBox
            title="Grocery per Student"
            value="₹103"
            subtitle="+₹5 from last month"
            gradient="from-green-500 to-emerald-600"
          />
          <BudgetStatBox
            title="Total per Student"
            value="₹281"
            subtitle="+₹20 from last month"
            gradient="from-blue-500 to-indigo-600"
          />
        </motion.div>

        {/* AI Predictions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            AI Budget Predictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Smart Forecasting
                </h3>
                <p className="text-gray-600 text-sm">
                  ML models analyze 6-month trends to predict next month&apos;s
                  expenses with 94% accuracy
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Usage Patterns
                </h3>
                <p className="text-gray-600 text-sm">
                  Identifies peak usage hours and suggests optimization
                  strategies
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Grocery Optimization
                </h3>
                <p className="text-gray-600 text-sm">
                  Recommends bulk purchases and seasonal items to reduce costs
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Budget Alerts
                </h3>
                <p className="text-gray-600 text-sm">
                  Automatic notifications when spending exceeds predicted
                  thresholds
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Historical Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            6-Month Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                    Electricity
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                    Grocery
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                    Total
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    month: "December",
                    elec: 28500,
                    grocery: 16500,
                    total: 45000,
                    change: "+8%",
                  },
                  {
                    month: "November",
                    elec: 26800,
                    grocery: 15200,
                    total: 42000,
                    change: "+5%",
                  },
                  {
                    month: "October",
                    elec: 25200,
                    grocery: 14800,
                    total: 40000,
                    change: "+2%",
                  },
                  {
                    month: "September",
                    elec: 24500,
                    grocery: 14700,
                    total: 39200,
                    change: "-3%",
                  },
                  {
                    month: "August",
                    elec: 25800,
                    grocery: 14600,
                    total: 40400,
                    change: "+6%",
                  },
                  {
                    month: "July",
                    elec: 24200,
                    grocery: 13900,
                    total: 38100,
                    change: "+4%",
                  },
                ].map((row, index) => (
                  <tr
                    key={row.month}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {row.month}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ₹{row.elec.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ₹{row.grocery.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      ₹{row.total.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        row.change.startsWith("+")
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
