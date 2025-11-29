package com.sqrc.module.backendsqrc.vista360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO para representar los datos básicos del cliente en Vista 360.
 * Mapea los campos mostrados en "Datos personales" y "Datos de contacto".
 */
@Data
@Builder
public class ClienteBasicoDTO {

    /**
     * ID único del cliente en el sistema
     */
    @NotNull(message = "El ID del cliente es obligatorio")
    private Integer idCliente;

    /**
     * Documento Nacional de Identidad (DNI)
     */
    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^\\d{8}$", message = "El DNI debe tener 8 dígitos")
    private String dni;

    /**
     * Nombre del cliente
     */
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    /**
     * Apellido del cliente
     */
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    /**
     * Fecha de nacimiento del cliente
     */
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    /**
     * Correo electrónico del cliente
     */
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    /**
     * Teléfono fijo del cliente (formato flexible)
     */
    private String telefono;

    /**
     * Teléfono celular del cliente
     */
    @Pattern(regexp = "^\\d{9}$", message = "El celular debe tener 9 dígitos")
    private String celular;
}
