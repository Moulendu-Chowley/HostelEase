import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg disabled:opacity-50",
    secondary:
      "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg disabled:opacity-50",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg disabled:opacity-50",
    warning:
      "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}
