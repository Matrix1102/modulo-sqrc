export type TicketStatus = "Abierto" | "Cerrado" | "Escalado" | "Derivado" | "Auditoría";
export type TicketType = "Solicitud" | "Queja" | "Reclamo" | "Consulta";
export type TicketChannel = "Llamada" | "Presencial" | "Web" | "Email" | "Chat" | "API" | "Interno" | "Aplicación Móvil" | "Otro";

export interface TicketSummary {
  id: number;
  reasonTitle: string;
  status: TicketStatus;
  relevantDate: Date;
  priority: string;
}

export interface AssignmentHistory {
  agentName: string;
  area: string;
  startDate: Date;
  endDate: Date | null;
  stepStatus: string;
  notes: string;
}

export interface TicketDetail {
  id: number;
  reasonTitle: string;
  status: TicketStatus;
  priority: string;
  description: string;
  type: TicketType;
  channel: TicketChannel;
  creationDate: Date;
  attentionDate: Date | null;
  closingDate: Date | null;
  kbArticleId: string | null;
  lastAgentName: string | null;
  assignmentHistory: AssignmentHistory[];
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterCriteria {
  term: string;
  dateRange: DateRange;
  status: TicketStatus[];
  type: TicketType | null;
  channel: TicketChannel | null;
}

export interface TicketService {
  searchTickets(filters: FilterCriteria): Promise<ReadonlyArray<TicketSummary>>;
  getTicketById(id: number): Promise<TicketDetail>;
}
