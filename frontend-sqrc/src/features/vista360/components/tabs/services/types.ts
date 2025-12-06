import type { PaymentStatus } from "../products";

export type ServiceStatus = "Activo" | "Suspendido" | "Cancelado";

export interface ServiceInvoice {
  id: string;
  period: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  downloadUrl: string;
  contractUrl: string;
  consumption: string;
  balance: number;
}

export interface ServiceContract {
  id: string;
  name: string;
  code: string;
  status: ServiceStatus;
  startDate: string;
  monthlyFee: number;
  nextInvoiceDate: string;
  invoices: ServiceInvoice[];
}
