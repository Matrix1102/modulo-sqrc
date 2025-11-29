package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.config.SlaProperties;
import com.sqrc.module.backendsqrc.reporte.model.KpiRendimientoAgenteDiario;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlaService {

    private final SlaProperties slaProperties;

    /**
     * Compute SLA compliance percentage using agent-daily KPI records as an approximation.
     * Calculation: (daysWhereAvgResolution <= threshold) / totalDays * 100
     * Returns 0.0 when records is empty.
     */
    public double computeCumplimientoFromDailyKpis(List<KpiRendimientoAgenteDiario> registros, String tipoCaso) {
        if (registros == null || registros.isEmpty()) return 0.0;

        int threshold = slaProperties.getThresholdForTipo(tipoCaso);

        long ok = registros.stream()
                .filter(r -> r.getTiempoPromedioResolucionMinutos() != null)
                .filter(r -> r.getTiempoPromedioResolucionMinutos() <= threshold)
                .count();

        double pct = (ok * 100.0) / registros.size();
        // round to 1 decimal
        return Math.round(pct * 10.0) / 10.0;
    }

    /**
     * Compute SLA compliance percentage using raw tickets (exact per-ticket computation).
     * Calculation: (ticketsWhereResolution <= threshold) / totalResolvedTickets * 100
     * Only tickets with non-null fechaCierre are considered resolved.
     */
    public double computeCumplimientoFromTickets(List<Ticket> tickets, String tipoCaso) {
        if (tickets == null || tickets.isEmpty()) return 0.0;

        int threshold = slaProperties.getThresholdForTipo(tipoCaso);

        long resolved = tickets.stream()
                .filter(t -> t.getFechaCierre() != null && t.getFechaCreacion() != null)
                .count();

        if (resolved == 0) return 0.0;

        long ok = tickets.stream()
                .filter(t -> t.getFechaCierre() != null && t.getFechaCreacion() != null)
                .filter(t -> {
                    long minutes = java.time.Duration.between(t.getFechaCreacion(), t.getFechaCierre()).toMinutes();
                    return minutes <= threshold;
                })
                .count();

        double pct = (ok * 100.0) / resolved;
        return Math.round(pct * 10.0) / 10.0;
    }
}
