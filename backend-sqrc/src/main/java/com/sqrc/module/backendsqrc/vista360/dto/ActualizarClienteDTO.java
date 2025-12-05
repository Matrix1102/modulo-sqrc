package com.sqrc.module.backendsqrc.vista360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar información del cliente.
 * Adaptado para la integración con el API externo de clientes (mod-ventas).
 * Todos los campos son editables excepto el ID del cliente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarClienteDTO {

    /**
     * DNI del cliente
     */
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe tener 8 dígitos")
    private String dni;

    /**
     * Nombre del cliente (firstName en API externo)
     */
    private String nombre;

    /**
     * Apellido del cliente (lastName en API externo)
     */
    private String apellido;

    /**
     * Correo electrónico del cliente (email en API externo)
     */
    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    /**
     * Teléfono del cliente (phoneNumber en API externo)
     */
    private String telefono;

    /**
     * Dirección del cliente (address en API externo)
     */
    private String direccion;

    /**
     * Fecha de registro del cliente (registrationDate en API externo)
     * Formato: yyyy-MM-dd
     */
    private String fechaRegistro;

    /**
     * Estado del cliente (ACTIVO, INACTIVO, etc.)
     */
    private String estado;

    /**
     * Categoría del cliente (Estándar, Premium, etc.)
     */
    private String categoria;
}
