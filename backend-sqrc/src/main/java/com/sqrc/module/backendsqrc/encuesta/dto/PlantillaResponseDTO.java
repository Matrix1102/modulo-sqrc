package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PlantillaResponseDTO {
    private String templateId;
    private String nombre;
    private String descripcion;
    private String estado; // "ACTIVA", "INACTIVA"
    private String alcanceEvaluacion;
    private List<PreguntaDTO> preguntas;
}