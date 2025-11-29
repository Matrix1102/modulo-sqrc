export interface DesgloseTipo {
  tipo: string;
  cantidad: number;
}

export interface KpiValor {
  valor: string | number | null;
  comparativoPeriodo?: number | null;
  comparativoPeriodo_pct?: number | null;
}

export interface KpisGlobales {
  totalCasos: number;
  desgloseTipo: DesgloseTipo[];
}

export interface MotivoFrecuente {
  motivo: string;
  cantidad: number;
}

export interface AgenteRanking {
  agenteId: number;
  nombre: string;
  rating: number;
  tickets?: number;
}

export interface AgenteDetail {
  agenteId: string;
  nombre: string;
  volumenTotalAtendido?: number;
  tiempoPromedioResolucion?: string;
  tiempoPromedioPrimeraRespuesta?: string | null;
  cumplimientoSlaPct?: number | null;
  csatPromedio?: number | null;
}

export interface DashboardKpis {
  kpisGlobales: KpisGlobales;
  kpisResumen: {
    ticketsAbiertos?: KpiValor;
    ticketsResueltos?: KpiValor;
    tiempoPromedio?: KpiValor;
  };
  motivosFrecuentes: MotivoFrecuente[];
  agentesMejorEvaluados: AgenteRanking[];
}

export interface TicketReporte {
  id: string;
  client: string;
  motive: string;
  date: string;
  status: string;
}

export interface AgentTickets {
  agenteId: string;
  agenteNombre: string;
  tickets: TicketReporte[];
}

export interface SurveyDashboard {
  csatPromedioAgente: number;
  csatPromedioServicio: number;
  totalRespuestas: number;
  tasaRespuestaPct: number; // percentage, e.g. 18.0
}