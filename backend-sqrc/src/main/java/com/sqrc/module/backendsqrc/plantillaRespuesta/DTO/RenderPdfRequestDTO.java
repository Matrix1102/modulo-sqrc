package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import java.util.Map;

public record RenderPdfRequestDTO(
        Map<String, Object> variables //revisar luego, tiene relacion con la generacion de pdf, revisar con RederPdfRequest
) {
}
