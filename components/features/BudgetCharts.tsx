import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ElectricityData {
  month: string;
  units: number;
  cost: number;
}

interface ElectricityChartProps {
  data: ElectricityData[];
}

export const ElectricityChart: React.FC<ElectricityChartProps> = ({ data }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-3">6-Month Consumption Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="units"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Units (kWh)"
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#10B981"
            strokeWidth={2}
            name="Cost (₹)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface GroceryData {
  category: string;
  amount: number;
}

interface GroceryChartProps {
  data: GroceryData[];
}

export const GroceryChart: React.FC<GroceryChartProps> = ({ data }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Category-wise Expenses</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#10B981" name="Amount (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BudgetStatBoxProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
}

export const BudgetStatBox: React.FC<BudgetStatBoxProps> = ({
  title,
  value,
  subtitle,
  gradient,
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};
