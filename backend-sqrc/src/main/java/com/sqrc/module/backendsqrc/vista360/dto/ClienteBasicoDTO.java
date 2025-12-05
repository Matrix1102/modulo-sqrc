package com.sqrc.module.backendsqrc.vista360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para representar los datos básicos del cliente en Vista 360.
 * Adaptado para la integración con el API externo de clientes (mod-ventas).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
     * Nombre del cliente (firstName del API externo)
     */
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    /**
     * Apellido del cliente (lastName del API externo)
     */
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    /**
     * Nombre completo (fullName del API externo)
     */
    private String nombreCompleto;

    /**
     * Correo electrónico del cliente (email del API externo)
     */
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    /**
     * Teléfono del cliente (phoneNumber del API externo)
     */
    private String telefono;

    /**
     * Dirección del cliente (address del API externo)
     */
    private String direccion;

    /**
     * Fecha de registro del cliente (registrationDate del API externo)
     */
    private LocalDate fechaRegistro;

    /**
     * Estado del cliente (ACTIVO, INACTIVO, etc.)
     */
    private String estado;

    /**
     * Categoría del cliente (Estándar, Premium, etc.)
     */
    private String categoria;
}
