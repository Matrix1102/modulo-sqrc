import type {
  FilterCriteria,
  TicketChannel,
  TicketStatus,
  TicketType,
} from "./types";

export const STATUS_BADGE_VARIANTS: Record<TicketStatus, string> = {
  Abierto: "bg-emerald-100 text-emerald-700",
  Cerrado: "bg-red-100 text-red-700",
  Escalado: "bg-amber-100 text-amber-700",
  Derivado: "bg-blue-100 text-blue-700",
  Auditoría: "bg-purple-100 text-purple-700",
};

export const STATUS_TEXT_VARIANTS: Record<TicketStatus, string> = {
  Abierto: "text-emerald-700",
  Cerrado: "text-red-700",
  Escalado: "text-amber-700",
  Derivado: "text-blue-700",
  Auditoría: "text-purple-700",
};

export const STATUS_OPTIONS: TicketStatus[] = [
  "Abierto",
  "Cerrado",
  "Escalado",
  "Derivado",
];

export const TYPE_OPTIONS: TicketType[] = [
  "Solicitud",
  "Queja",
  "Reclamo",
];

export const CHANNEL_OPTIONS: TicketChannel[] = [
  "Llamada",
  "Presencial",
];

export const formatDate = (value: Date | null): string => {
  if (!value) {
    return "No registrado";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
};

export const formatDateTime = (value: Date | null): string => {
  if (!value) {
    return "No registrado";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

export const formatShortDate = (value: Date): string =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export const createDefaultFilters = (): FilterCriteria => ({
  term: "",
  dateRange: { start: null, end: null },
  status: [],
  type: null,
  channel: null,
});
