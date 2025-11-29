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