package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de respuesta paginada para listados.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginaResponse<T> {

    private List<T> contenido;
    private Integer paginaActual;
    private Integer totalPaginas;
    private Long totalElementos;
    private Integer tamanoPagina;
    private Boolean esPrimera;
    private Boolean esUltima;
    private Boolean tieneAnterior;
    private Boolean tieneSiguiente;
}
