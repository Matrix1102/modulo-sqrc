package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para documentación de ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentacionDto {
    
    private Long idDocumentacion;
    private String problema;
    private String articulo;
    private LocalDateTime fechaCreacion;
    private EmployeeDto autor;
    private ArticuloVersionDto articuloKB;
}
