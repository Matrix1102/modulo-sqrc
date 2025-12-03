import React, { useState } from "react";
import Customer360Layout from "../../features/vista360/components/Customer360Layout";
import BasicViewContainer from "../../features/vista360/components/BasicViewContainer";
import CustomerProductsView from "../../features/vista360/components/CustomerProductsView";
import CustomerServicesView from "../../features/vista360/components/CustomerServicesView";
import CustomerTicketsView from "../../features/vista360/components/CustomerTicketsView";
import { CustomerProvider } from "../../features/vista360/context/CustomerContext";

const Vista360Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("basico");

  return (
    <CustomerProvider>
      <Customer360Layout activeTab={activeTab} onTabChange={(t) => setActiveTab(t)}>
        {/* Only render the basic view for now; other tabs can be added later */}
        {activeTab === "basico" && <BasicViewContainer />}
        {activeTab === "servicios" && <CustomerServicesView />}
        {activeTab === "productos" && <CustomerProductsView />}
        {activeTab === "ticket" && (
          <CustomerTicketsView />
        )}
      </Customer360Layout>
    </CustomerProvider>
  );
};

export default Vista360Page;
