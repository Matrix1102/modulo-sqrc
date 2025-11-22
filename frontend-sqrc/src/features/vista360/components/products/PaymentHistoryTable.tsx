import React from "react";
import DocumentAction from "./DocumentAction";
import StatusBadge from "./StatusBadge";
import type { PaymentDocument } from "./types";

interface PaymentHistoryTableProps {
  productName: string;
  documents: PaymentDocument[];
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ productName, documents }) => {
  const handleDocumentAction = (url: string) => {
    if (!url || url === "#") {
      // Placeholder action until integration with real documentos
      return;
    }

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">Detalle de pagos</h3>
        <p className="text-sm text-gray-500">{productName || "Selecciona un producto para ver su historial"}</p>
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
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay comprobantes asociados al producto seleccionado en las fechas indicadas.
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
                  <DocumentAction onClick={() => handleDocumentAction(document.downloadUrl)} />
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
