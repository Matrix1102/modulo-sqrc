package com.sqrc.module.backendsqrc.reporte.batch;

import com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion;
import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import com.sqrc.module.backendsqrc.encuesta.model.EstadoEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;
// import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso; // Descomentar cuando uses Ticket
import com.sqrc.module.backendsqrc.reporte.model.*;
import com.sqrc.module.backendsqrc.reporte.repository.*;

// TODO: Descomentar cuando exista el módulo de Tickets
// import com.sqrc.module.backendsqrc.ticket.model.Ticket;
// import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
// import java.util.Map;          // Descomentar cuando uses la lógica de Tickets
// import java.util.stream.Collectors; // Descomentar cuando uses la lógica de Tickets

@Component
@RequiredArgsConstructor
@Slf4j
public class CalculoKpiDiarioJob {

    // --- Repositorios Transaccionales (Lectura) ---
    
    // TODO: Descomentar cuando exista el TicketRepository
    // private final TicketRepository ticketRepository;
    
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

    // ==========================================
    // MÉTODOS DE CÁLCULO POR TABLA
    // ==========================================

    private void procesarResumenDiario(LocalDate fecha) {
        log.info("--- Procesando Resumen Diario (Lógica comentada hasta tener módulo Tickets) ---");
        /*
        // TODO: Descomentar lógica cuando TicketRepository exista
        List<Ticket> ticketsCreados = ticketRepository.findByFechaCreacion(fecha);
        List<Ticket> ticketsResueltos = ticketRepository.findByFechaCierre(fecha);

        var mapaCreados = ticketsCreados.stream()
            .collect(Collectors.groupingBy(t -> t.getTipo() + "|" + t.getCanal(), Collectors.counting()));

        mapaCreados.forEach((clave, cantidad) -> {
            String[] parts = clave.split("\\|");
            TipoCaso tipo = TipoCaso.valueOf(parts[0]);
            String canal = parts[1];

            long resueltos = ticketsResueltos.stream()
                .filter(t -> t.getTipo() == tipo && t.getCanal().equals(canal))
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
        */
    }

    private void procesarRendimientoAgentes(LocalDate fecha) {
        log.info("--- Procesando Rendimiento Agentes (Lógica comentada hasta tener módulo Tickets) ---");
        /*
        // TODO: Descomentar lógica cuando TicketRepository exista
        List<Ticket> cerrados = ticketRepository.findByFechaCierre(fecha);

        Map<Long, List<Ticket>> porAgente = cerrados.stream()
                .collect(Collectors.groupingBy(Ticket::getIdAgenteCierre));

        porAgente.forEach((agenteId, tickets) -> {
            double tiempoPromedio = tickets.stream()
                    .mapToLong(Ticket::getTiempoResolucionMinutos)
                    .average().orElse(0);

            // Valor dummy hasta integrar cruce real
            Double csatSimulado = 4.5; 

            KpiRendimientoAgenteDiario kpi = KpiRendimientoAgenteDiario.builder()
                    .fecha(fecha)
                    .agenteId(agenteId)
                    .ticketsResueltosTotal(tickets.size())
                    .tiempoPromedioResolucionMinutos((int) tiempoPromedio)
                    .csatPromedioAgente(csatSimulado)
                    .build();

            agentesRepo.save(kpi);
        });
        */
    }

    private void procesarMotivosFrecuentes(LocalDate fecha) {
        log.info("--- Procesando Motivos Frecuentes (Lógica comentada hasta tener módulo Tickets) ---");
        /*
        // TODO: Descomentar lógica cuando TicketRepository exista
        List<Ticket> tickets = ticketRepository.findByFechaCreacion(fecha);

        Map<Long, Long> conteoMotivos = tickets.stream()
                .collect(Collectors.groupingBy(Ticket::getIdMotivo, Collectors.counting()));

        conteoMotivos.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(10)
            .forEach(entry -> {
                KpiMotivosFrecuentes kpi = KpiMotivosFrecuentes.builder()
                        .fecha(fecha)
                        .idMotivo(entry.getKey())
                        .conteoTotal(entry.getValue().intValue())
                        .build();
                motivosRepo.save(kpi);
            });
        */
    }

    private void procesarTiemposResolucion(LocalDate fecha) {
        log.info("--- Procesando Tiempos Resolución (Lógica comentada hasta tener módulo Tickets) ---");
        /*
        // TODO: Descomentar lógica cuando TicketRepository exista
        List<Ticket> cerrados = ticketRepository.findByFechaCierre(fecha);

        var agrupado = cerrados.stream()
                .collect(Collectors.groupingBy(t -> t.getTipo() + "|" + t.getCanal()));

        agrupado.forEach((clave, lista) -> {
            String[] parts = clave.split("\\|");
            
            double tiempoRes = lista.stream()
                    .mapToLong(Ticket::getTiempoResolucionMinutos)
                    .average().orElse(0);
            
            double tiempoPrimResp = lista.stream()
                    .mapToLong(Ticket::getTiempoPrimeraRespuestaMinutos) 
                    .average().orElse(0);

            KpiTiemposResolucion kpi = KpiTiemposResolucion.builder()
                    .fecha(fecha)
                    .tipoCaso(TipoCaso.valueOf(parts[0]))
                    .canal(parts[1])
                    .tiempoPromedioResolucionTotalMin((int) tiempoRes)
                    .tiempoPromedioPrimeraRespuestaMin((int) tiempoPrimResp)
                    .build();

            tiemposRepo.save(kpi);
        });
        */
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