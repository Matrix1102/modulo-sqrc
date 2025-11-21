import React from "react";
import CustomerSearch from "./CustomerSearch";
import CustomerProfileForm from "./CustomerProfileForm";
import ServiceStatsGrid from "./ServiceStatsGrid";

const BasicViewContainer: React.FC = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_1fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <CustomerSearch />
        </div>
        <div className="flex-1">
          <CustomerProfileForm />
        </div>
      </div>

      <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas de atención</h3>
          <span className="text-sm text-gray-500">Últimos 30 días</span>
        </div>
        <div className="mt-4 flex-1">
          <ServiceStatsGrid />
        </div>
      </section>
    </div>
  );
};

export default BasicViewContainer;
