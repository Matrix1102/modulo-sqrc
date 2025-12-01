package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para el historial de asignaciones de un ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentHistoryDTO {
    
    private String agentName; // nombre del empleado asignado
    private String area; // área de asignación
    private LocalDateTime startDate; // fecha de inicio
    private LocalDateTime endDate; // fecha de fin (null si está activo)
    private String stepStatus; // estado del paso (ej: "En revisión", "Derivación", etc.)
    private String notes; // notas o comentarios
}
