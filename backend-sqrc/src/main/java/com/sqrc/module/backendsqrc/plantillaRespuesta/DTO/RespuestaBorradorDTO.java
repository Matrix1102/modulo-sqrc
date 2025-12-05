package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

public record RespuestaBorradorDTO(
        String titulo,       // Para el input "Título"
        String cuerpo,       // Para el textarea (Ya con variables reemplazadas)
        String despedida,    // Para el input "Despedida"
        String htmlPreview   // Para el iframe de la izquierda (Hoja Bond completa)
) {}
