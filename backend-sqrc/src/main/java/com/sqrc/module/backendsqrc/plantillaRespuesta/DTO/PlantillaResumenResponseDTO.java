package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;

import java.time.LocalDateTime;

public record PlantillaResumenResponseDTO(
        Long id,
        String nombre,
        TipoCaso categoria,
        boolean activa,        // Para el estado "Activa/Inactiva"
        LocalDateTime creada,  // Para "Creada el"
        LocalDateTime modificada // Para "Última modificación"
) {
}
