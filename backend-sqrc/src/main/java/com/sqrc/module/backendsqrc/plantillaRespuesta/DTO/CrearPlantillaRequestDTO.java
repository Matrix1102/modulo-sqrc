package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

public record CrearPlantillaRequestDTO(
        String nombreInterno,
        String tituloVisible,
        TipoCaso tipoCaso,
        String htmlModelo,
        String cuerpo,
        String despedida
) {
}
