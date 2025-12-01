package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre", length = 200)
    private String nombre;

    @Column(name = "correo", length = 255)
    private String correo;

    @Column(name = "telefono", length = 50)
    private String telefono;

    @Column(name = "puesto", length = 100)
    private String puesto;
}
