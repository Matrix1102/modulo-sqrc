import React from "react";
import { Badge } from "../../../../components/ui/Badge";
import type { PaymentStatus } from "./types";

const STATUS_VARIANTS: Record<PaymentStatus, "success" | "warning" | "danger"> = {
  Pagado: "success",
  "Pago parcial": "warning",
  Pendiente: "danger",
};

interface StatusBadgeProps {
  status: PaymentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
};

export default StatusBadge;

export type { PaymentStatus };
