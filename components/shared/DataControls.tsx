import { Download, FileSpreadsheet, FileText } from "lucide-react";
import React from "react";

interface ExportButtonProps {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportPDF,
  onExportCSV,
  onExportExcel,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
      >
        <Download className="h-4 w-4" /> Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[150px] z-10">
          {onExportPDF && (
            <button
              onClick={() => {
                onExportPDF();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <FileText className="h-4 w-4 text-red-500" /> Export PDF
            </button>
          )}
          {onExportCSV && (
            <button
              onClick={() => {
                onExportCSV();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <FileText className="h-4 w-4 text-green-500" /> Export CSV
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={() => {
                onExportExcel();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-500" /> Export Excel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  );
};
