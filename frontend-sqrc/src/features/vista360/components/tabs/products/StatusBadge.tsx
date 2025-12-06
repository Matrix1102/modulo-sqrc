import React from "react";
import { Badge } from "../../../../../components/ui/Badge";
import type { PaymentStatus } from "./types";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "danger" | "blue" | "neutral"> = {
  Pagado: "success",
  "Pago parcial": "warning",
  Pendiente: "danger",
  Activo: "success",
  Suspendido: "warning",
  Cancelado: "danger",
};

interface StatusBadgeProps {
  status: PaymentStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant = STATUS_VARIANTS[status] || "neutral";
  return <Badge variant={variant}>{status}</Badge>;
};

export default StatusBadge;

export type { PaymentStatus };
