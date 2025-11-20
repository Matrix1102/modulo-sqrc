package com.sqrc.module.backendsqrc.encuesta.dto; // <--- OJO AL PACKAGE

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PlantillaRequestDTO {
    private String nombre;
    private String descripcion;
    private String alcanceEvaluacion; // "SERVICIO" o "AGENTE"
    private List<PreguntaDTO> preguntas;
}