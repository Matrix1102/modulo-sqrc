import React from "react";
import KBTabNavigation from "./KBTabNavigation";

interface Props {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children?: React.ReactNode;
}

const KBLayout: React.FC<Props> = ({
  activeTab = "todos",
  onTabChange,
  children,
}) => {
  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          BASE DE CONOCIMIENTO
        </h1>
      </div>

      {/* Main Card with Tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <KBTabNavigation activeTab={activeTab} onChange={onTabChange} />
        <div className="border-t border-gray-100 p-6">{children}</div>
      </div>
    </section>
  );
};

export default KBLayout;
