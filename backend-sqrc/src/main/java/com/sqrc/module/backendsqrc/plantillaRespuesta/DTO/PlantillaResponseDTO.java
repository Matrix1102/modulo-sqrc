package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

public record PlantillaResponseDTO(
        String nombreInterno,
        String tituloVisible,
        TipoCaso tipoCaso,
        boolean activo,
        String fechaCreacion,
        String cuerpo,
        String despedida
) {
}
