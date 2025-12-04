export type PaymentStatus = "Pagado" | "Pago parcial" | "Pendiente";

export interface PaymentDocument {
  id: string;
  issueDate: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  downloadUrl: string;
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
}
