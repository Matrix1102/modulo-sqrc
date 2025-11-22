import React from "react";
import ServiceAccordionItem from "./ServiceAccordionItem";
import type { ServiceContract } from "./types";

interface ServiceMasterListProps {
  services: ServiceContract[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
}

const ServiceMasterList: React.FC<ServiceMasterListProps> = ({ services, selectedServiceId, onSelectService }) => {
  return (
    <aside className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Servicios contratados</h3>
          <p className="text-xs text-gray-500">{services.length} resultados</p>
        </div>
      </header>

      <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {services.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No se encontraron servicios con los filtros aplicados.
          </div>
        )}

        {services.map((service) => (
          <ServiceAccordionItem
            key={service.id}
            service={service}
            isActive={service.id === selectedServiceId}
            onSelect={onSelectService}
          />
        ))}
      </div>
    </aside>
  );
};

export default ServiceMasterList;
