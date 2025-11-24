package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

import java.time.LocalDateTime;

public record PlantillaResponseDTO(
        Long idPlantilla,
        String nombreInterno,
        String tituloVisible,
        TipoCaso tipoCaso,
        boolean activo,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion,
        String cuerpo,
        String despedida
) {
}
