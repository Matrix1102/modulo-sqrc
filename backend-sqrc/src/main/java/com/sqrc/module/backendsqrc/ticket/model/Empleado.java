package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

/**
 * Entidad base para todos los empleados del sistema.
 * 
 * Patrón: Herencia JPA con estrategia JOINED
 * - Cada subtipo tiene su propia tabla que se une con la tabla empleados
 * 
 * Jerarquía:
 * Empleado (base)
 * ├── Supervisor
 * ├── BackOffice
 * └── Agente (abstract)
 * ├── AgenteLlamada
 * └── AgentePresencial
 * 
 * Nota: El discriminator value "AGENTE" mapea a la clase base Empleado
 * para compatibilidad con registros existentes en la BD remota.
 */
@Entity
@Table(name = "empleados")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo_empleado", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("AGENTE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "apellido", length = 100)
    private String apellido;

    @Column(name = "dni", length = 8, unique = true)
    private String dni;

    @Column(name = "correo", length = 255)
    private String correo;

    @Column(name = "numero_celular", length = 20)
    private String numeroCelular;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "area", length = 100)
    private String area;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_empleado", insertable = false, updatable = false)
    private TipoEmpleado tipoEmpleado;

    /**
     * Obtiene el nombre completo del empleado
     */
    public String getNombreCompleto() {
        return (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "");
    }
}
