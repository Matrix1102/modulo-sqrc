import React from "react";
import TabNavigation, { type TabKey } from "./TabNavigation";

interface Props {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  children?: React.ReactNode;
}

const Customer360Layout: React.FC<Props> = ({
  activeTab = "basico",
  onTabChange,
  children,
}) => {
  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <TabNavigation activeTab={activeTab} onChange={onTabChange} />
        <div className="border-t border-gray-100 p-6">{children}</div>
      </div>
    </section>
  );
};

export default Customer360Layout;
