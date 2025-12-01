package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para artículo de base de conocimiento
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticuloVersionDto {
    
    private Integer idArticuloKB;
    private String titulo;
    private String contenido;
}
