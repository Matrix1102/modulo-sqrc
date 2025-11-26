package com.sqrc.module.backendsqrc.encuesta.dto; // <--- OJO AL PACKAGE

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PlantillaRequestDTO {
    @NotBlank(message = "El nombre de la plantilla es obligatorio")
    private String nombre;

    private String descripcion;

    private String alcanceEvaluacion; // "SERVICIO" o "AGENTE"

    @Valid
    @Size(min = 1, message = "La plantilla debe contener al menos una pregunta")
    private List<PreguntaDTO> preguntas;
}