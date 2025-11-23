package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import java.util.Map;

public record VistaPreviaRequestDTO(
        Map<String, Object> variables //es algo para poder llenar el html, luego ervisar mejor
) {
}
