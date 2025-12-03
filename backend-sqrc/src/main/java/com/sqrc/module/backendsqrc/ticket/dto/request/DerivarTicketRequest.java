package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para derivar un ticket del BackOffice a un área especializada.
 * 
 * Cuando BackOffice deriva un ticket:
 * 1. El estado cambia de ESCALADO a DERIVADO
 * 2. Se finaliza la asignación del BackOffice
 * 3. Se crea una nueva asignación al área especializada
 * 4. Se inicia un hilo de correo para comunicación
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DerivarTicketRequest {

    /**
     * ID del empleado BackOffice que está derivando
     */
    @NotNull(message = "El ID del BackOffice es obligatorio")
    private Long backofficeId;

    /**
     * ID del área especializada a la que se deriva
     */
    @NotNull(message = "El ID del área es obligatorio")
    private Long areaId;

    /**
     * Motivo de la derivación
     */
    @NotBlank(message = "El motivo de derivación es obligatorio")
    private String motivoDerivacion;

    /**
     * Detalles adicionales para el área especializada
     */
    private String detallesProblema;

    /**
     * Correo del módulo especializado para el hilo de comunicación
     */
    private String correoModuloEspecializado;
}
