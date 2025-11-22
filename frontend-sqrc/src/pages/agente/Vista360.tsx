import React, { useState } from "react";
import Customer360Layout from "../../features/vista360/components/Customer360Layout";
import BasicViewContainer from "../../features/vista360/components/BasicViewContainer";
import CustomerProductsView from "../../features/vista360/components/CustomerProductsView";

const Vista360Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("basico");

  return (
    <Customer360Layout activeTab={activeTab} onTabChange={(t) => setActiveTab(t)}>
      {/* Only render the basic view for now; other tabs can be added later */}
      {activeTab === "basico" && <BasicViewContainer />}
      {activeTab === "servicios" && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Servicios (placeholder)
        </div>
      )}
      {activeTab === "productos" && <CustomerProductsView />}
      {activeTab === "ticket" && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Ticket (placeholder)
        </div>
      )}
    </Customer360Layout>
  );
};

export default Vista360Page;
