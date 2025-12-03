package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para búsqueda y filtrado de artículos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusquedaArticuloRequest {

    private String texto; // Búsqueda por título, resumen o contenido
    private Etiqueta etiqueta; // Filtro por categoría
    private Visibilidad visibilidad;// Filtro por visibilidad
    private TipoCaso tipoCaso; // Filtro por tipo de caso
    private Long idPropietario; // Filtro por propietario
    private Boolean soloVigentes; // Solo artículos vigentes
    private Boolean soloPublicados; // Solo artículos publicados
    private String ordenarPor; // Campo de ordenamiento
    private String direccion; // ASC o DESC

    @Builder.Default
    private Integer pagina = 0;

    @Builder.Default
    private Integer tamanoPagina = 10;
}
