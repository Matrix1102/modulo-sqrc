package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para mapear la respuesta del endpoint externo de empleados.
 * Solo se utilizan los campos necesarios para nuestra entidad Empleado.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoExternoDTO {

    private Long idEmpleado;
    private String codigoEmpleado;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String documentoIdentidad;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private String genero;
    private String estadoCivil;
    private String nacionalidad;
    private String direccion;
    private String telefono;
    private String email;
    private String emailCorporativo;
    private LocalDate fechaIngreso;
    private LocalDate fechaCese;
    private String estado;
    private String tipoContrato;
    private String modalidadTrabajo;
    private Integer idPuesto;
    private String nombrePuesto;
    private String departamento;
    private String area;
    private String nivelJerarquico;
    private BigDecimal salarioMinimo;
    private BigDecimal salarioMaximo;
    private LocalDate fechaInicioPuesto;
    private LocalDate fechaFinPuesto;
    private BigDecimal salarioAsignado;

    /**
     * Obtiene el apellido completo concatenando paterno y materno
     */
    public String getApellidoCompleto() {
        StringBuilder sb = new StringBuilder();
        if (apellidoPaterno != null && !apellidoPaterno.isEmpty()) {
            sb.append(apellidoPaterno);
        }
        if (apellidoMaterno != null && !apellidoMaterno.isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(apellidoMaterno);
        }
        return sb.toString();
    }
}
