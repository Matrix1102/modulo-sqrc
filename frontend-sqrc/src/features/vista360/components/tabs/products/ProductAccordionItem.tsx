import React from "react";
import { CalendarClock, ChevronDown, CreditCard } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { VistaProduct } from "./types";

interface ProductAccordionItemProps {
  product: VistaProduct;
  isActive: boolean;
  onSelect: (productId: string) => void;
}

const ProductAccordionItem: React.FC<ProductAccordionItemProps> = ({ product, isActive, onSelect }) => {
  return (
    <div className={`rounded-xl border ${isActive ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"} shadow-sm transition-colors`}>
      <button
        type="button"
        onClick={() => onSelect(product.id)}
        aria-expanded={isActive}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
          <p className="text-xs text-gray-500">Código: {product.code}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={product.status} />
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${isActive ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      {isActive && (
        <div className="space-y-3 border-t border-blue-100 px-4 pb-4 pt-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CreditCard size={16} className="mt-0.5 text-blue-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-500">Forma de pago</p>
              <p className="font-medium text-gray-800">{product.paymentForm}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarClock size={16} className="mt-0.5 text-blue-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-500">Fecha inicio de compra</p>
              <p className="font-medium text-gray-800">{product.startDate}</p>
            </div>
          </div>
          {product.paymentForm === "Pago a Cuotas" && (
            <div className="flex items-start gap-2">
              <CalendarClock size={16} className="mt-0.5 text-blue-500" />
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-500">Próxima facturación</p>
                <p className="font-medium text-gray-800">{product.nextBillingDate}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductAccordionItem;
