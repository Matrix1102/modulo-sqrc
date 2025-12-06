export type PaymentStatus = "Pagado" | "Pago parcial" | "Pendiente" | "Activo" | "Suspendido" | "Cancelado";

export interface PaymentDocument {
  id: string;
  issueDate: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  downloadUrl: string;
  contractUrl: string;
  paymentMethod: string;
  balance: number;
}

export interface VistaProduct {
  id: string;
  name: string;
  code: string;
  status: PaymentStatus;
  startDate: string;
  paymentForm: "Pago Único" | "Pago a Cuotas";
  nextBillingDate: string;
  documents: PaymentDocument[];
  type: "product" | "service";
}

export interface ProductFilterState {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  type: "todos" | "product" | "service";
}
