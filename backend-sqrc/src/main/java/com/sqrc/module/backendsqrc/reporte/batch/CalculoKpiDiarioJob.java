package com.sqrc.module.backendsqrc.reporte.batch;

import com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion;
import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import com.sqrc.module.backendsqrc.encuesta.model.EstadoEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;
// import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso; // Descomentar cuando uses Ticket
import com.sqrc.module.backendsqrc.reporte.model.*;
import com.sqrc.module.backendsqrc.reporte.repository.*;

import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.model.Reclamo;
import com.sqrc.module.backendsqrc.ticket.model.Solicitud;
import com.sqrc.module.backendsqrc.ticket.model.Queja;
import com.sqrc.module.backendsqrc.ticket.model.Consulta;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

@Component
@RequiredArgsConstructor
@Slf4j
public class CalculoKpiDiarioJob {

    // --- Repositorios Transaccionales (Lectura) ---
    
    private final TicketRepository ticketRepository;
    
    private final EncuestaRepository encuestaRepository;

    // --- Repositorios de Reportes (Escritura - Tablas KPI) ---
    private final KpiResumenDiarioRepository resumenRepo;
    private final KpiRendimientoAgenteDiarioRepository agentesRepo;
    private final KpiMotivosFrecuentesRepository motivosRepo;
    private final KpiTiemposResolucionRepository tiemposRepo;
    private final KpiDashboardEncuestasRepository dashboardEncuestasRepo;

    /**
     * Proceso Batch Nocturno.
     * Se ejecuta automáticamente todos los días a la 1:00 AM.
     * Procesa y guarda los datos del día anterior.
     */
    @Scheduled(cron = "0 0 1 * * ?") 
    @Transactional
    public void procesarCierreDiario() {
        // Trabajamos con los datos de "Ayer" (el día que acaba de cerrar)
        LocalDate ayer = LocalDate.now().minusDays(1);
        log.info(">>> Iniciando cálculo de KPIs para la fecha: {}", ayer);

        try {
            // 1. Volumen de Tickets (Pendiente)
            procesarResumenDiario(ayer);

            // 2. Rendimiento Individual (Pendiente)
            procesarRendimientoAgentes(ayer);

            // 3. Top Motivos (Pendiente)
            procesarMotivosFrecuentes(ayer);

            // 4. Tiempos de Atención (Pendiente)
            procesarTiemposResolucion(ayer);

            // 5. Calidad y Satisfacción (ACTIVO)
            procesarDashboardEncuestas(ayer);

            log.info("<<< Cálculo de KPIs finalizado exitosamente.");

        } catch (Exception e) {
            log.error("❌ Error crítico en el proceso batch de KPIs", e);
        }
    }

    // Helper to derive a TipoCaso string from the Ticket instance using instanceof checks
    private String deriveTipoString(Ticket t) {
        if (t instanceof Reclamo) return "RECLAMO";
        if (t instanceof Solicitud) return "SOLICITUD";
        if (t instanceof Queja) return "QUEJA";
        if (t instanceof Consulta) return "CONSULTA";
        return "UNKNOWN";
    }

    // ==========================================
    // MÉTODOS DE CÁLCULO POR TABLA
    // ==========================================

    private void procesarResumenDiario(LocalDate fecha) {
        log.info("--- Procesando Resumen Diario (Lógica comentada hasta tener módulo Tickets) ---");
        // We'll compute a conservative resumen using available Ticket fields.
        List<Ticket> ticketsCreados = ticketRepository.findByFechaCreacion(fecha);
        List<Ticket> ticketsResueltos = ticketRepository.findByFechaCierre(fecha);

        // Group by tipo (derived from class) and use 'GLOBAL' as canal when canal info is not present
        Map<String, Long> mapaCreados = ticketsCreados.stream()
            .collect(Collectors.groupingBy(t -> deriveTipoString(t) + "|GLOBAL", Collectors.counting()));

        mapaCreados.forEach((clave, cantidad) -> {
            String[] parts = clave.split("\\|");
            String tipoStr = parts[0];
            String canal = parts[1];

            TipoCaso tipo;
            try {
                tipo = TipoCaso.valueOf(tipoStr);
            } catch (Exception ex) {
                tipo = null;
            }

            long resueltos = ticketsResueltos.stream()
                    .filter(t -> deriveTipoString(t).equals(tipoStr))
                    .count();

            KpiResumenDiario kpi = KpiResumenDiario.builder()
                    .fecha(fecha)
                    .tipoCaso(tipo)
                    .canal(canal)
                    .totalCasosCreados(cantidad.intValue())
                    .totalCasosResueltos((int) resueltos)
                    .build();

            resumenRepo.save(kpi);
        });
    }

    private void procesarRendimientoAgentes(LocalDate fecha) {
        log.info("--- Procesando Rendimiento Agentes (Lógica comentada hasta tener módulo Tickets) ---");
        // Agent-level performance requires agent assignment data which may not be present.
        // Keep as TODO: when Ticket/Asignacion contains agent references, implement this.
        log.info("Skipping agent performance: agent attribution not available in Ticket model yet.");
    }

    private void procesarMotivosFrecuentes(LocalDate fecha) {
        log.info("--- Procesando Motivos Frecuentes (Lógica comentada hasta tener módulo Tickets) ---");
        // Motivos frecuentes require a motivo/id field in Ticket; leave as TODO.
        log.info("Skipping motivos frecuentes: motivo id not available in Ticket model yet.");
    }

    private void procesarTiemposResolucion(LocalDate fecha) {
        log.info("--- Procesando Tiempos Resolución (Lógica comentada hasta tener módulo Tickets) ---");
        // Compute average resolution time per tipo (derived) and default canal GLOBAL
        List<Ticket> cerrados = ticketRepository.findByFechaCierre(fecha);

        Map<String, List<Ticket>> agrupado = cerrados.stream()
            .collect(Collectors.groupingBy(t -> deriveTipoString(t) + "|GLOBAL"));

        agrupado.forEach((clave, lista) -> {
            String[] parts = clave.split("\\|");
            String tipoStr = parts[0];

            double tiempoRes = lista.stream()
                .filter(t -> t.getFechaCreacion() != null && t.getFechaCierre() != null)
                .mapToLong(t -> java.time.Duration.between(t.getFechaCreacion(), t.getFechaCierre()).toMinutes())
                .average().orElse(0);

            // No reliable primera respuesta in the Ticket model currently; set 0
            double tiempoPrimResp = 0;

            KpiTiemposResolucion kpi = KpiTiemposResolucion.builder()
                .fecha(fecha)
                .tipoCaso(TipoCaso.valueOf(tipoStr))
                .canal("GLOBAL")
                .tiempoPromedioResolucionTotalMin((int) tiempoRes)
                .tiempoPromedioPrimeraRespuestaMin((int) tiempoPrimResp)
                .build();

            tiemposRepo.save(kpi);
        });
    }

    private void procesarDashboardEncuestas(LocalDate fecha) {
        log.info("--- Procesando Dashboard Encuestas ---");
        
        // 1. Definir rango del día completo (00:00:00 a 23:59:59)
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23, 59, 59);

        // 2. Buscar encuestas enviadas en ese día
        // (Asegúrate de haber agregado este método en EncuestaRepository)
        List<Encuesta> encuestasDelDia = encuestaRepository.findByFechaEnvioBetween(inicio, fin);

        if (encuestasDelDia.isEmpty()) {
            log.info("No se encontraron encuestas enviadas el {}", fecha);
            return;
        }

        // 3. Calcular Métricas
        long enviadas = encuestasDelDia.size();
        long respondidas = encuestasDelDia.stream()
                .filter(e -> e.getEstadoEncuesta() == EstadoEncuesta.RESPONDIDA)
                .count();
        
        double tasaRespuesta = (enviadas > 0) ? (double) respondidas / enviadas : 0.0;

        // Filtramos solo las respondidas para calcular promedios
        List<Encuesta> respuestas = encuestasDelDia.stream()
                .filter(e -> e.getEstadoEncuesta() == EstadoEncuesta.RESPONDIDA)
                .toList();

        double csatAgente = calcularPromedioCsat(respuestas, AlcanceEvaluacion.AGENTE);
        double csatServicio = calcularPromedioCsat(respuestas, AlcanceEvaluacion.SERVICIO);

        // 4. Guardar en tabla histórica
        KpiDashboardEncuestas kpi = KpiDashboardEncuestas.builder()
                .fecha(fecha)
                .totalRespuestasGlobal((int) respondidas)
                .tasaRespuestaGlobal(tasaRespuesta)
                .csatPromedioAgenteGlobal(csatAgente)
                .csatPromedioServicioGlobal(csatServicio)
                .build();

        dashboardEncuestasRepo.save(kpi);
        log.info("Guardado KPI Encuestas: Tasa={}% CSAT_Agente={}", tasaRespuesta * 100, csatAgente);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private double calcularPromedioCsat(List<Encuesta> encuestas, AlcanceEvaluacion alcance) {
        return encuestas.stream()
                .filter(e -> e.getAlcanceEvaluacion() == alcance)
                .flatMap(e -> e.getRespuestaEncuesta().getRespuestas().stream())
                // Buscamos solo respuestas numéricas (tipo RATING/RADIO con valores "1", "2"...)
                .filter(r -> esNumerico(r.getValor())) 
                .mapToInt(r -> Integer.parseInt(r.getValor()))
                .average()
                .orElse(0.0);
    }

    private boolean esNumerico(String str) {
        if (str == null) return false;
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Utilidad para regenerar datos históricos manualmente.
     * Útil cuando despliegas el sistema por primera vez o tras limpiar la BD.
     */
    public void regenerarHistorico(LocalDate inicio, LocalDate fin) {
        log.info("Regenerando histórico desde {} hasta {}", inicio, fin);
        inicio.datesUntil(fin.plusDays(1)).forEach(fecha -> {
            try {
                procesarResumenDiario(fecha);
                procesarRendimientoAgentes(fecha);
                procesarMotivosFrecuentes(fecha);
                procesarTiemposResolucion(fecha);
                procesarDashboardEncuestas(fecha);
            } catch (Exception e) {
                log.error("Error regenerando fecha {}", fecha, e);
            }
        });
    }
}