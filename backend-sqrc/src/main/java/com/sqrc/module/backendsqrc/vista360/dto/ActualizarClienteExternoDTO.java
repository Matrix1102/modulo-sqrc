package com.sqrc.module.backendsqrc.vista360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para enviar datos de actualización al API externo de clientes.
 * PATCH https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente/{idCliente}
 * 
 * Campos editables: dni, firstName, lastName, email, phoneNumber, telefonoFijo, address, fechaNacimiento, estado
 * Campos NO editables: clienteId, registrationDate, categoria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarClienteExternoDTO {

    @JsonProperty("dni")
    private String dni;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phoneNumber")
    private String phoneNumber;

    @JsonProperty("telefonoFijo")
    private String telefonoFijo;

    @JsonProperty("address")
    private String address;

    @JsonProperty("fechaNacimiento")
    private String fechaNacimiento;

    @JsonProperty("estado")
    private String estado;
}
