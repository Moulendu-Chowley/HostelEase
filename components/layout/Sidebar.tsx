import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavigationLink {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

interface SidebarProps {
  links: NavigationLink[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ links, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg z-30"
      >
        <div className="p-6">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            ☰
          </button>
        </div>

        <nav className="px-4">
          {links.map((link, index) => (
            <Link key={index} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
                  link.active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <link.icon size={20} />
                {isOpen && <span className="font-medium">{link.label}</span>}
              </motion.div>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main content offset */}
      <div
        style={{ marginLeft: isOpen ? 280 : 80 }}
        className="transition-all duration-200"
      />
    </>
  );
}
