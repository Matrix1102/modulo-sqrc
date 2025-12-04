package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO con el contexto extraído de la documentación y asignación
 * para enviar a la IA.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContextoDocumentacionDTO {

    // Información del ticket
    private Long idTicket;
    private String asuntoTicket;
    private String descripcionTicket;
    private String tipoTicket;
    private String estadoTicket;
    private String origenTicket;
    private String motivoTicket;

    // Información de la documentación
    private Long idDocumentacion;
    private String problema;
    private String solucion;
    private String fechaDocumentacion;

    // Información de la asignación
    private Long idAsignacion;
    private String areaAsignacion;
    private String nombreAgente;
    private String fechaInicioAsignacion;
    private String fechaFinAsignacion;

    // Información adicional del ticket específico
    private String infoAdicionalTipoTicket;
}
