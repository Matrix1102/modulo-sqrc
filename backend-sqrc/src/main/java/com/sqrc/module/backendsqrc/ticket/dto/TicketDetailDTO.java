package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO con detalle completo de un ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailDTO {

    private Long id;
    private String reasonTitle; // nombre del motivo
    private String status; // estado del ticket
    private String priority; // prioridad
    private String description; // descripción del ticket
    private String type; // tipo: CONSULTA, QUEJA, RECLAMO, SOLICITUD
    private String channel; // origen/canal: Llamada, Presencial
    private LocalDateTime creationDate; // fecha de creación
    private LocalDateTime attentionDate; // fecha de primera atención (primera asignación)
    private LocalDateTime closingDate; // fecha de cierre
    private String kbArticleId; // ID del artículo de base de conocimiento
    private String lastAgentName; // nombre del último agente asignado
    private List<AssignmentHistoryDTO> assignmentHistory; // historial de asignaciones
}
