import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  gradient?: string;
}

export default function PageContainer({
  children,
  gradient = "from-blue-50 via-indigo-50 to-purple-50",
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} p-6`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
