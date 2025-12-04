package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    // Opción A: Si tu entidad Empleado tiene un campo 'area' (String o Enum)
    @Query("SELECT e FROM Empleado e WHERE e.area = :area")
    List<Empleado> findByArea(@Param("area") String area);

    // Opción B: Si usas herencia y quieres buscar por tipo de clase (ej: BackOffice)
    // @Query("SELECT e FROM BackOffice e")
    // List<Empleado> findAllBackoffice();
}
