import React from "react";
import DocumentAction from "../products/DocumentAction";
import StatusBadge from "../products/StatusBadge";
import type { ServiceInvoice } from "./types";

interface ServiceBillingTableProps {
  serviceName: string;
  invoices: ServiceInvoice[];
  monthlyFee: number;
}

const ServiceBillingTable: React.FC<ServiceBillingTableProps> = ({ serviceName, invoices, monthlyFee }) => {
  const handleDocumentAction = (url: string) => {
    if (!url || url === "#") {
      return;
    }

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">Detalle de facturación</h3>
        <p className="text-sm text-gray-500">{serviceName || "Selecciona un servicio para ver su historial"}</p>
        {serviceName && (
          <p className="text-xs font-medium text-emerald-600">Monto mensual: S/ {monthlyFee.toFixed(2)}</p>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Periodo</th>
              <th className="px-4 py-3">Emisión</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Consumo</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay facturas registradas para el servicio seleccionado.
                </td>
              </tr>
            )}

            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{invoice.period}</td>
                <td className="px-4 py-3 text-gray-700">{invoice.issueDate}</td>
                <td className="px-4 py-3 text-gray-700">{invoice.dueDate}</td>
                <td className="px-4 py-3 text-gray-700">{invoice.consumption}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">S/ {invoice.amount.toFixed(2)}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">S/ {invoice.balance.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <DocumentAction onClick={() => handleDocumentAction(invoice.downloadUrl)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ServiceBillingTable;
