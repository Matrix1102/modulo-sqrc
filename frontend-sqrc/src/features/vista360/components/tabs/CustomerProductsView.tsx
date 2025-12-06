import React, { useEffect, useMemo, useState } from "react";
import {
  ProductFilterBar,
  ProductMasterList,
  PaymentHistoryTable,
} from "./products";
import type { PaymentDocument, VistaProduct } from "./products";

// URL de contrato de Google Drive para productos
const CONTRACT_URL_PRODUCTS = "https://drive.google.com/file/d/1zW8PmfMDr94mY4lLB3Ac9AW9hTRRNzYY/view";

// 6 PRODUCTOS
const MOCK_PRODUCTS: VistaProduct[] = [
  {
    id: "prd-001",
    name: "Samsung Galaxy S24 Ultra 512GB",
    code: "SKU-S24U-512",
    status: "Pagado",
    startDate: "2025-02-04",
    paymentForm: "Pago Único",
    nextBillingDate: "2025-02-18",
    type: "product",
    documents: [
      {
        id: "doc-001",
        issueDate: "2025-02-04",
        amount: 5899.0,
        status: "Pagado",
        reference: "FAC-2025-02-00124",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Visa Crédito •••• 4721",
        balance: 0,
      },
      {
        id: "doc-002",
        issueDate: "2025-02-12",
        amount: 89.0,
        status: "Pagado",
        reference: "GAR-2025-02-00041",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Visa Crédito •••• 4721",
        balance: 0,
      },
    ],
  },
  {
    id: "prd-002",
    name: "iPhone 15 Pro Max 256GB",
    code: "SKU-IP15PM-256",
    status: "Pago parcial",
    startDate: "2025-01-22",
    paymentForm: "Pago a Cuotas",
    nextBillingDate: "2025-11-22",
    type: "product",
    documents: [
      {
        id: "doc-003",
        issueDate: "2025-02-22",
        amount: 499.9,
        status: "Pago parcial",
        reference: "CUO-2025-02-00671",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Crédito Directo (cuota 2 de 12)",
        balance: 2499.5,
      },
      {
        id: "doc-004",
        issueDate: "2025-01-22",
        amount: 899.9,
        status: "Pagado",
        reference: "FAC-2025-01-00088",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Pago inicial - Yape",
        balance: 0,
      },
    ],
  },
  {
    id: "prd-003",
    name: "iPad Air 13'' M2 Wi-Fi",
    code: "SKU-IPAD-A13",
    status: "Pendiente",
    startDate: "2025-03-08",
    paymentForm: "Pago Único",
    nextBillingDate: "2025-03-21",
    type: "product",
    documents: [
      {
        id: "doc-005",
        issueDate: "2025-03-08",
        amount: 3799.0,
        status: "Pendiente",
        reference: "FAC-2025-03-00012",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Transferencia BCP",
        balance: 3799.0,
      },
    ],
  },
  {
    id: "prd-004",
    name: "MacBook Pro 14'' M3 Pro",
    code: "SKU-MBP14-M3P",
    status: "Pagado",
    startDate: "2025-01-15",
    paymentForm: "Pago a Cuotas",
    nextBillingDate: "2025-07-15",
    type: "product",
    documents: [
      {
        id: "doc-006",
        issueDate: "2025-01-15",
        amount: 2500.0,
        status: "Pagado",
        reference: "FAC-2025-01-00045",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Pago inicial - Mastercard •••• 8812",
        balance: 0,
      },
      {
        id: "doc-007",
        issueDate: "2025-02-15",
        amount: 1250.0,
        status: "Pagado",
        reference: "CUO-2025-02-00112",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Cuota 1 de 6 - Débito automático",
        balance: 5000.0,
      },
    ],
  },
  {
    id: "prd-005",
    name: "Sony WH-1000XM5 Auriculares",
    code: "SKU-SONY-XM5",
    status: "Pagado",
    startDate: "2025-03-01",
    paymentForm: "Pago Único",
    nextBillingDate: "2025-03-01",
    type: "product",
    documents: [
      {
        id: "doc-008",
        issueDate: "2025-03-01",
        amount: 1499.0,
        status: "Pagado",
        reference: "FAC-2025-03-00003",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Yape",
        balance: 0,
      },
    ],
  },
  {
    id: "prd-006",
    name: "Apple Watch Ultra 2",
    code: "SKU-AWU2-49",
    status: "Pago parcial",
    startDate: "2025-02-20",
    paymentForm: "Pago a Cuotas",
    nextBillingDate: "2025-05-20",
    type: "product",
    documents: [
      {
        id: "doc-009",
        issueDate: "2025-02-20",
        amount: 1200.0,
        status: "Pagado",
        reference: "FAC-2025-02-00089",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Pago inicial - Plin",
        balance: 0,
      },
      {
        id: "doc-010",
        issueDate: "2025-03-20",
        amount: 600.0,
        status: "Pago parcial",
        reference: "CUO-2025-03-00034",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_PRODUCTS,
        paymentMethod: "Cuota 1 de 3",
        balance: 1200.0,
      },
    ],
  },
];

// NOTA: Los servicios se muestran en CustomerServicesView

interface ProductFilterState {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: ProductFilterState = {
  search: "",
  status: "todos",
  dateFrom: "",
  dateTo: "",
};

const CustomerProductsView: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  const [selectedProductId, setSelectedProductId] = useState<string>(MOCK_PRODUCTS[0]?.id ?? "");

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch = [product.name, product.code]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.trim().toLowerCase());

      const matchesStatus =
        filters.status === "todos" || product.status.toLowerCase() === filters.status.toLowerCase();

      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      const productDate = new Date(product.nextBillingDate);

      const matchesDate =
        (!fromDate || productDate >= fromDate) && (!toDate || productDate <= toDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [filters]);

  const selectedProduct = filteredProducts.find((product) => product.id === selectedProductId)
    ?? filteredProducts[0]
    ?? null;

  const paymentHistory: PaymentDocument[] = selectedProduct?.documents ?? [];

  const handleFilterChange = (partial: Partial<ProductFilterState>) => {
    setFilters((prev: ProductFilterState) => ({ ...prev, ...partial }));
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  useEffect(() => {
    if (filteredProducts.length === 0) {
      if (selectedProductId !== "") {
        setSelectedProductId("");
      }
      return;
    }

    const hasSelectedProduct = filteredProducts.some((product) => product.id === selectedProductId);
    if (!hasSelectedProduct) {
      setSelectedProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, selectedProductId]);

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ProductFilterBar
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <ProductMasterList
          products={filteredProducts}
          selectedProductId={selectedProduct?.id ?? ""}
          onSelectProduct={handleSelectProduct}
        />

        <PaymentHistoryTable
          productName={selectedProduct?.name ?? ""}
          documents={paymentHistory}
        />
      </div>
    </section>
  );
};

export default CustomerProductsView;
