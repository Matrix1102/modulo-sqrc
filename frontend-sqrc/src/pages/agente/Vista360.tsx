import React, { useState } from "react";
import { 
  Customer360Layout, 
  BasicViewContainer, 
  CustomerProductsView, 
  CustomerServicesView, 
  CustomerTicketsView,
  type TabKey
} from "../../features/vista360/components";
import { CustomerProvider } from "../../features/vista360/context/CustomerContext";

const Vista360Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("basico");

  return (
    <CustomerProvider>
      <Customer360Layout activeTab={activeTab} onTabChange={(t) => setActiveTab(t)}>
        {activeTab === "basico" && <BasicViewContainer />}
        {activeTab === "servicios" && <CustomerServicesView />}
        {activeTab === "productos" && <CustomerProductsView />}
        {activeTab === "ticket" && <CustomerTicketsView />}
      </Customer360Layout>
    </CustomerProvider>
  );
};

export default Vista360Page;
