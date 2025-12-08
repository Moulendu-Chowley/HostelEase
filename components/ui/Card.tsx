import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  gradient?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  className = "",
  gradient = "from-white to-white",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 ${
        hover ? "cursor-pointer" : ""
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
