package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class EncuestaResultadoDTO {
    private String responseId;
    private String ticketId;
    private String agente;      // Nombre del agente
    private String cliente;     // Email o nombre del cliente
    private String puntaje;     // Ej: "3.2/5"
    private String comentario;  // Feedback principal
    private String tiempo;      // Ej: "Hace 5 min" o fecha absoluta
    private String fechaRespuesta;
    private List<ResultadoPreguntaDTO> resultados; // Para el detalle
}