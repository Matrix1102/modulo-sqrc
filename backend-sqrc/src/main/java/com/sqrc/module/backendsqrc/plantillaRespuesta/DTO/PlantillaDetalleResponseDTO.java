package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

public record PlantillaDetalleResponseDTO(

        Long id,
        String nombreInterno,
        String tituloVisible,
        TipoCaso categoria,
        String cuerpo,         // <--- EL PESADO
        String despedida,
        String htmlModel
) {
}
