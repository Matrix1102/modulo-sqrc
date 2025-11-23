package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

public record ActualizarPlantillaRequestDTO(
        String nombreInterno,
        String tituloVisible,
        TipoCaso tipoCaso,
        String htmlModelo,
        String cuerpo,
        String despedida,
        boolean activo
) {
}
