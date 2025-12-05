package com.sqrc.module.backendsqrc.baseDeConocimientos.strategy;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ContextoDocumentacionDTO;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.OperacionInvalidaException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.GeminiService;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.DocumentacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * Strategy para generar artículos desde documentación de tickets existentes.
 * 
 * Esta estrategia extrae el contexto de una documentación de ticket
 * (problema, solución, información del ticket) y lo envía a Gemini
 * para generar un artículo estructurado.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentacionStrategy implements GeneracionArticuloStrategy {

    private final GeminiService geminiService;
    private final DocumentacionRepository documentacionRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public ArticuloGeneradoIA generar(GeneracionArticuloRequest request) {
        log.info("Generando artículo desde documentación ID: {}", request.getIdDocumentacion());

        // Obtener la documentación con join a asignación y ticket
        Documentacion documentacion = documentacionRepository.findById(request.getIdDocumentacion())
                .orElseThrow(() -> new OperacionInvalidaException(
                        "Documentación no encontrada con ID: " + request.getIdDocumentacion()));

        // Extraer el contexto completo
        ContextoDocumentacionDTO contexto = extraerContexto(documentacion);

        // Llamar a Gemini para generar el contenido
        return geminiService.generarArticuloDesdeContexto(contexto);
    }

    @Override
    public boolean soporta(GeneracionArticuloRequest request) {
        return request.esDesdeDocumentacion();
    }

    @Override
    public String getNombre() {
        return "DOCUMENTACION";
    }

    @Override
    public String getDescripcion() {
        return "Genera artículos desde documentación de tickets existentes";
    }

    /**
     * Extrae el contexto completo desde la documentación.
     */
    private ContextoDocumentacionDTO extraerContexto(Documentacion documentacion) {
        Asignacion asignacion = documentacion.getAsignacion();
        if (asignacion == null) {
            throw new OperacionInvalidaException("La documentación no tiene asignación asociada");
        }

        Ticket ticket = asignacion.getTicket();
        if (ticket == null) {
            throw new OperacionInvalidaException("La asignación no tiene ticket asociado");
        }

        // Extraer valores inmediatamente para evitar problemas de sesión lazy
        Long ticketId = ticket.getIdTicket();
        String asunto = ticket.getAsunto() != null ? ticket.getAsunto() : "";
        String descripcion = ticket.getDescripcion() != null ? ticket.getDescripcion() : "";
        String tipo = ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : "NO_DEFINIDO";
        String estado = ticket.getEstado() != null ? ticket.getEstado().name() : "NO_DEFINIDO";
        String origen = ticket.getOrigen() != null ? ticket.getOrigen().name() : "NO_DEFINIDO";
        String motivo = ticket.getMotivo() != null ? ticket.getMotivo().getNombre() : "Sin motivo";

        // Obtener información adicional según el tipo de ticket
        String infoAdicional = extraerInfoAdicionalTicket(ticket);

        // Extraer datos de asignación
        Long asignacionId = asignacion.getIdAsignacion();
        String area = asignacion.getAreaId() != null ? "Área " + asignacion.getAreaId() : "Sin área";
        String agente = asignacion.getEmpleado() != null ? asignacion.getEmpleado().getNombre() : "Sin agente";
        String fechaInicio = asignacion.getFechaInicio() != null
                ? asignacion.getFechaInicio().format(FECHA_FORMATTER)
                : "";
        String fechaFin = asignacion.getFechaFin() != null
                ? asignacion.getFechaFin().format(FECHA_FORMATTER)
                : "En curso";

        return ContextoDocumentacionDTO.builder()
                // Información del ticket
                .idTicket(ticketId)
                .asuntoTicket(asunto)
                .descripcionTicket(descripcion)
                .tipoTicket(tipo)
                .estadoTicket(estado)
                .origenTicket(origen)
                .motivoTicket(motivo)
                // Información de la documentación
                .idDocumentacion(documentacion.getIdDocumentacion())
                .problema(documentacion.getProblema())
                .solucion(documentacion.getSolucion())
                .fechaDocumentacion(documentacion.getFechaCreacion() != null
                        ? documentacion.getFechaCreacion().format(FECHA_FORMATTER)
                        : "")
                // Información de la asignación
                .idAsignacion(asignacionId)
                .areaAsignacion(area)
                .nombreAgente(agente)
                .fechaInicioAsignacion(fechaInicio)
                .fechaFinAsignacion(fechaFin)
                // Info adicional del tipo de ticket
                .infoAdicionalTipoTicket(infoAdicional)
                .build();
    }

    /**
     * Extrae información adicional según el tipo específico de ticket.
     */
    private String extraerInfoAdicionalTicket(Ticket ticket) {
        if (ticket instanceof Consulta consulta) {
            return "Tema de consulta: " + (consulta.getTema() != null ? consulta.getTema() : "No especificado");
        } else if (ticket instanceof Queja queja) {
            StringBuilder sb = new StringBuilder();
            if (queja.getImpacto() != null) {
                sb.append("Impacto: ").append(queja.getImpacto());
            }
            if (queja.getAreaInvolucrada() != null) {
                if (sb.length() > 0) sb.append(". ");
                sb.append("Área involucrada: ").append(queja.getAreaInvolucrada());
            }
            return sb.toString();
        } else if (ticket instanceof Solicitud solicitud) {
            return "Tipo de solicitud: " + (solicitud.getTipoSolicitud() != null
                    ? solicitud.getTipoSolicitud()
                    : "No especificado");
        } else if (ticket instanceof Reclamo) {
            return "Tipo: Reclamo formal";
        }
        return null;
    }
}
