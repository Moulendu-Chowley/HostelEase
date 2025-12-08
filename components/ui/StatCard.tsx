import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  subtitle?: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl`}
    >
      <Icon className="text-3xl mb-2" size={32} />
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-2 opacity-80">{subtitle}</p>}
    </motion.div>
  );
}
