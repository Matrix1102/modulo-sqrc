package com.sqrc.module.backendsqrc.vista360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para mapear la respuesta del API externo de clientes (mod-ventas).
 * GET/PATCH https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente/{idCliente}
 * GET https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente/dni/{dni}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteExternoDTO {

    @JsonProperty("clienteId")
    private Integer clienteId;

    @JsonProperty("dni")
    private String dni;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("fullName")
    private String fullName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phoneNumber")
    private String phoneNumber;

    @JsonProperty("telefonoFijo")
    private String telefonoFijo;

    @JsonProperty("address")
    private String address;

    @JsonProperty("fechaNacimiento")
    private LocalDate fechaNacimiento;

    @JsonProperty("registrationDate")
    private LocalDate registrationDate;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("categoria")
    private String categoria;
}
