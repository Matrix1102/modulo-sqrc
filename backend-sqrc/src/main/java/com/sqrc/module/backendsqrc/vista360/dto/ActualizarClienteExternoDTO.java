package com.sqrc.module.backendsqrc.vista360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para enviar datos de actualización al API externo de clientes.
 * PATCH https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente/{idCliente}
 * Todos los campos son editables excepto clienteId.
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

    @JsonProperty("address")
    private String address;

    @JsonProperty("registrationDate")
    private String registrationDate;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("categoria")
    private String categoria;
}
