import React from "react";
import { CalendarClock, CalendarDays, ChevronDown, Receipt, Wallet } from "lucide-react";
import ServiceStatusBadge from "./ServiceStatusBadge";
import type { ServiceContract } from "./types";

interface ServiceAccordionItemProps {
  service: ServiceContract;
  isActive: boolean;
  onSelect: (serviceId: string) => void;
}

const ServiceAccordionItem: React.FC<ServiceAccordionItemProps> = ({ service, isActive, onSelect }) => {
  const outstandingBalance = service.invoices.reduce((total, invoice) => total + invoice.balance, 0);
  const balanceTone = outstandingBalance === 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className={`rounded-xl border ${isActive ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"} shadow-sm transition-colors`}>
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        aria-expanded={isActive}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{service.name}</h4>
          <p className="text-xs text-gray-500">Código: {service.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <ServiceStatusBadge status={service.status} />
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${isActive ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      {isActive && (
        <div className="space-y-3 border-t border-emerald-100 px-4 pb-4 pt-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Receipt size={16} className="mt-0.5 text-emerald-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-600">Cuota mensual</p>
              <p className="font-medium text-gray-800">S/ {service.monthlyFee.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wallet size={16} className={`mt-0.5 ${balanceTone}`} />
            <div>
              <p className={`text-xs uppercase tracking-wide ${balanceTone}`}>Saldo</p>
              <p className={`font-semibold ${balanceTone}`}>S/ {outstandingBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays size={16} className="mt-0.5 text-emerald-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-600">Inicio de servicio</p>
              <p className="font-medium text-gray-800">{service.startDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarClock size={16} className="mt-0.5 text-emerald-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-600">Próxima facturación</p>
              <p className="font-medium text-gray-800">{service.nextInvoiceDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAccordionItem;
