import React from "react";
import ProductAccordionItem from "./ProductAccordionItem";
import type { VistaProduct } from "./types";

interface ProductMasterListProps {
  products: VistaProduct[];
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
}

const ProductMasterList: React.FC<ProductMasterListProps> = ({ products, selectedProductId, onSelectProduct }) => {
  return (
    <aside className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Productos contratados</h3>
          <p className="text-xs text-gray-500">{products.length} resultados</p>
        </div>
      </header>

      <div className="space-y-3 overflow-y-auto pr-1 max-h-[28rem]">
        {products.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No se encontraron productos con los filtros actuales.
          </div>
        )}

        {products.map((product) => (
          <ProductAccordionItem
            key={product.id}
            product={product}
            isActive={product.id === selectedProductId}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </aside>
  );
};

export default ProductMasterList;
