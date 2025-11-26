package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import java.util.Map;

public record EnviarRespuestaRequestDTO(
        Long idAsignacion,        // A qué ticket/asignación estamos respondiendo
        Long idPlantilla,         // Qué plantilla usó
        String correoDestino,     // A quién se lo enviamos
        String asunto,            // Asunto del correo
        Map<String, Object> variables // Los datos para rellenar (Nombre, Fecha, etc.)

) {
}
