package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import java.time.LocalDateTime;

public record RespuestaTablaDTO(
        Long idRespuesta,
        LocalDateTime fechaEnvio,
        Integer idCliente,    // Usamos Integer porque tu Vista360 usa Integer
        String dniCliente,
        String nombreCliente, // Nombre completo
        String tipoRespuesta,
        String asunto,
        String urlPdf
) {
}
