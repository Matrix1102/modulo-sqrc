package com.sqrc.module.backendsqrc.vista360.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Entidad JPA que representa un cliente en la base de datos.
 * Mapea la tabla 'clientes' en MySQL.
 */
@Entity
@Table(name = "clientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteEntity {

    /**
     * ID autoincremental del cliente
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    /**
     * Documento Nacional de Identidad (único)
     */
    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    /**
     * Nombres del cliente
     */
    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    /**
     * Apellidos del cliente
     */
    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    /**
     * Fecha de nacimiento
     */
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    /**
     * Correo electrónico
     */
    @Column(name = "correo", nullable = false, length = 150)
    private String correo;

    /**
     * Teléfono fijo
     */
    @Column(name = "telefono", length = 20)
    private String telefono;

    /**
     * Teléfono celular
     */
    @Column(name = "celular", length = 9)
    private String celular;

    /**
     * Fecha de registro del cliente
     */
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDate fechaRegistro;

    /**
     * Estado del cliente (activo/inactivo)
     */
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDate.now();
        }
    }
}
