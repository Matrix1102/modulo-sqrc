import React from "react";
import StatusBadge from "./StatusBadge";
import { FileText } from "lucide-react";
import type { PaymentDocument } from "./types";

interface PaymentHistoryTableProps {
  productName: string;
  documents: PaymentDocument[];
  isService?: boolean;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ productName, documents, isService = false }) => {
  const handleOpenUrl = (url: string) => {
    if (!url || url === "#") return;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {isService ? "Detalle de facturación" : "Detalle de pagos"}
        </h3>
        <p className="text-sm text-gray-500">
          {productName || (isService ? "Selecciona un servicio para ver su historial" : "Selecciona un producto para ver su historial")}
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Emisión</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  {isService 
                    ? "No hay facturas asociadas al servicio seleccionado."
                    : "No hay comprobantes asociados al producto seleccionado."
                  }
                </td>
              </tr>
            )}

            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{document.issueDate}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{document.reference}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">S/ {document.amount.toFixed(2)}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">S/ {document.balance.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={document.status} />
                </td>
                <td className="px-4 py-3 text-gray-700">{document.paymentMethod}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleOpenUrl(document.contractUrl)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                    aria-label="Ver contrato"
                    title="Ver contrato"
                  >
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default PaymentHistoryTable;
