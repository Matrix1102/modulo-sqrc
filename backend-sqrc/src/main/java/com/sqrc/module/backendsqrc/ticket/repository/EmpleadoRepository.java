package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.TipoEmpleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    // Buscar empleados por área
    @Query("SELECT e FROM Empleado e WHERE e.area = :area")
    List<Empleado> findByArea(@Param("area") String area);

    // Buscar empleados por tipo
    List<Empleado> findByTipoEmpleado(TipoEmpleado tipoEmpleado);

    // Buscar empleados por múltiples tipos
    List<Empleado> findByTipoEmpleadoIn(List<TipoEmpleado> tipos);

    // Buscar empleado por DNI
    Optional<Empleado> findByDni(String dni);

    // Actualizar tipo de empleado con SQL nativo (bypass del discriminator column)
    @Modifying
    @Query(value = "UPDATE empleados SET tipo_empleado = :tipo WHERE id_empleado = :id", nativeQuery = true)
    void actualizarTipoEmpleado(@Param("id") Long id, @Param("tipo") String tipo);
}
