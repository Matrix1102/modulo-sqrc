import React from "react";
import { Badge } from "../../../../../components/ui/Badge";
import type { ServiceStatus } from "./types";

const STATUS_VARIANTS: Record<ServiceStatus, "success" | "warning" | "danger"> = {
  Activo: "success",
  Suspendido: "warning",
  Cancelado: "danger",
};

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status }) => {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
};

export default ServiceStatusBadge;
