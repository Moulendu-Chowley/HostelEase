import { ReactNode } from "react";

interface FilterBarProps {
  filters: {
    value: string;
    label: string;
  }[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  actions?: ReactNode;
}

export default function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  actions,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              activeFilter === filter.value
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
