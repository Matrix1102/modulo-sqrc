import React, { useEffect, useMemo, useState } from "react";
import { Wifi } from "lucide-react";
import {
  ServiceFilterBar,
  ServiceMasterList,
  ServiceBillingTable,
} from "./services";
import type { ServiceFilterState, ServiceContract, ServiceInvoice } from "./services";
import { useCustomer } from "../../context/CustomerContext";

// URL de contrato de Google Drive para servicios
const CONTRACT_URL_SERVICES = "https://drive.google.com/file/d/1Lq44cW2TQMwqzm44nparLpiGlc5OP8On/view";

const MOCK_SERVICES: ServiceContract[] = [
  {
    id: "srv-001",
    name: "Plan Telefonía Empresarial 20 Líneas",
    code: "TLP-20",
    status: "Activo",
    startDate: "2023-06-15",
    monthlyFee: 189.9,
    nextInvoiceDate: "2025-12-10",
    invoices: [
      {
        id: "svc-inv-001",
        period: "Octubre 2025",
        issueDate: "2025-10-10",
        dueDate: "2025-10-25",
        amount: 189.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-10-001",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "1 180 min",
        balance: 0,
      },
      {
        id: "svc-inv-002",
        period: "Noviembre 2025",
        issueDate: "2025-11-10",
        dueDate: "2025-11-25",
        amount: 189.9,
        status: "Pendiente",
        reference: "FAC-SVC-2025-11-001",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "960 min",
        balance: 189.9,
      },
    ],
  },
  {
    id: "srv-002",
    name: "Internet Fibra 500 Mbps",
    code: "NET-500",
    status: "Activo",
    startDate: "2024-02-01",
    monthlyFee: 249.5,
    nextInvoiceDate: "2025-12-05",
    invoices: [
      {
        id: "svc-inv-003",
        period: "Octubre 2025",
        issueDate: "2025-10-05",
        dueDate: "2025-10-20",
        amount: 249.5,
        status: "Pagado",
        reference: "FAC-SVC-2025-10-223",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "470 GB",
        balance: 0,
      },
      {
        id: "svc-inv-004",
        period: "Noviembre 2025",
        issueDate: "2025-11-05",
        dueDate: "2025-11-20",
        amount: 249.5,
        status: "Pagado",
        reference: "FAC-SVC-2025-11-204",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "455 GB",
        balance: 0,
      },
    ],
  },
  {
    id: "srv-003",
    name: "Soporte Técnico Premium",
    code: "STS-PRE",
    status: "Suspendido",
    startDate: "2022-11-20",
    monthlyFee: 99.0,
    nextInvoiceDate: "2025-12-20",
    invoices: [
      {
        id: "svc-inv-005",
        period: "Septiembre 2025",
        issueDate: "2025-09-20",
        dueDate: "2025-10-05",
        amount: 99.0,
        status: "Pagado",
        reference: "FAC-SVC-2025-09-310",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "1 200 min",
        balance: 0,
      },
      {
        id: "svc-inv-006",
        period: "Octubre 2025",
        issueDate: "2025-10-20",
        dueDate: "2025-11-04",
        amount: 99.0,
        status: "Pendiente",
        reference: "FAC-SVC-2025-10-308",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "680 min",
        balance: 99.0,
      },
    ],
  },
  {
    id: "srv-004",
    name: "TV Cable Premium HD",
    code: "TV-PRE-HD",
    status: "Activo",
    startDate: "2024-03-10",
    monthlyFee: 119.9,
    nextInvoiceDate: "2025-12-10",
    invoices: [
      {
        id: "svc-inv-007",
        period: "Octubre 2025",
        issueDate: "2025-10-10",
        dueDate: "2025-10-25",
        amount: 119.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-10-445",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "180 canales",
        balance: 0,
      },
      {
        id: "svc-inv-008",
        period: "Noviembre 2025",
        issueDate: "2025-11-10",
        dueDate: "2025-11-25",
        amount: 119.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-11-412",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "180 canales",
        balance: 0,
      },
    ],
  },
  {
    id: "srv-005",
    name: "Cloud Storage Empresarial 5TB",
    code: "CLD-ENT-5T",
    status: "Activo",
    startDate: "2024-06-01",
    monthlyFee: 79.9,
    nextInvoiceDate: "2025-12-01",
    invoices: [
      {
        id: "svc-inv-009",
        period: "Octubre 2025",
        issueDate: "2025-10-01",
        dueDate: "2025-10-15",
        amount: 79.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-10-567",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "2.8 TB usado",
        balance: 0,
      },
      {
        id: "svc-inv-010",
        period: "Noviembre 2025",
        issueDate: "2025-11-01",
        dueDate: "2025-11-15",
        amount: 79.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-11-534",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "3.1 TB usado",
        balance: 0,
      },
    ],
  },
  {
    id: "srv-006",
    name: "Seguro de Equipos Total",
    code: "SEG-EQP-TOT",
    status: "Activo",
    startDate: "2024-01-15",
    monthlyFee: 49.9,
    nextInvoiceDate: "2025-12-15",
    invoices: [
      {
        id: "svc-inv-011",
        period: "Octubre 2025",
        issueDate: "2025-10-15",
        dueDate: "2025-10-30",
        amount: 49.9,
        status: "Pagado",
        reference: "FAC-SVC-2025-10-789",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "3 equipos cubiertos",
        balance: 0,
      },
      {
        id: "svc-inv-012",
        period: "Noviembre 2025",
        issueDate: "2025-11-15",
        dueDate: "2025-11-30",
        amount: 49.9,
        status: "Pendiente",
        reference: "FAC-SVC-2025-11-756",
        downloadUrl: "#",
        contractUrl: CONTRACT_URL_SERVICES,
        consumption: "3 equipos cubiertos",
        balance: 49.9,
      },
    ],
  },
];

const DEFAULT_FILTERS: ServiceFilterState = {
  search: "",
  status: "todos",
  dateFrom: "",
  dateTo: "",
};

const CustomerServicesView: React.FC = () => {
  const { cliente } = useCustomer();
  const [filters, setFilters] = useState<ServiceFilterState>(DEFAULT_FILTERS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(MOCK_SERVICES[0]?.id ?? "");

  const totalOutstandingAllServices = useMemo(() => {
    return MOCK_SERVICES.reduce((total, service) => {
      const serviceBalance = service.invoices.reduce((subTotal, invoice) => subTotal + invoice.balance, 0);
      return total + serviceBalance;
    }, 0);
  }, []);

  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((service) => {
      const matchesSearch = [service.name, service.code]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.trim().toLowerCase());

      const matchesStatus = filters.status === "todos" || service.status.toLowerCase() === filters.status;

      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      const serviceDate = new Date(service.nextInvoiceDate);

      const matchesDate = (!fromDate || serviceDate >= fromDate) && (!toDate || serviceDate <= toDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [filters]);

  const selectedService = filteredServices.find((service) => service.id === selectedServiceId)
    ?? filteredServices[0]
    ?? null;

  const invoices: ServiceInvoice[] = selectedService?.invoices ?? [];

  const handleFilterChange = (partial: Partial<ServiceFilterState>) => {
    setFilters((prev: ServiceFilterState) => ({ ...prev, ...partial }));
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  useEffect(() => {
    if (filteredServices.length === 0) {
      if (selectedServiceId !== "") {
        setSelectedServiceId("");
      }
      return;
    }

    const hasSelectedService = filteredServices.some((service) => service.id === selectedServiceId);
    if (!hasSelectedService) {
      setSelectedServiceId(filteredServices[0].id);
    }
  }, [filteredServices, selectedServiceId]);

  // Si no hay cliente, mostrar estado vacío
  if (!cliente) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Wifi size={40} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700">Sin cliente seleccionado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Busca un cliente en la pestaña "Básico" para ver sus servicios
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ServiceFilterBar filters={filters} onFiltersChange={handleFilterChange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <ServiceMasterList
          services={filteredServices}
          selectedServiceId={selectedService?.id ?? ""}
          onSelectService={handleSelectService}
        />

        <ServiceBillingTable
          serviceName={selectedService?.name ?? ""}
          invoices={invoices}
          monthlyFee={selectedService?.monthlyFee ?? 0}
        />
      </div>

      <div
        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          totalOutstandingAllServices === 0
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : "border-red-200 bg-red-50 text-red-600"
        }`}
      >
        Saldo total de servicios: S/ {totalOutstandingAllServices.toFixed(2)}
      </div>
    </section>
  );
};

export default CustomerServicesView;
