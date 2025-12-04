package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Supervisor.
 * Nota: Para este proyecto consideramos que todos los empleados están activos.
 */
@Repository
public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {

    /**
     * Busca Supervisor por correo.
     */
    Optional<Supervisor> findByCorreo(String correo);

    /**
     * Busca Supervisor por área.
     */
    List<Supervisor> findByArea(String area);

    /**
     * Busca Supervisor por departamento.
     */
    List<Supervisor> findByDepartamento(String departamento);

    /**
     * Busca Supervisores que pueden aprobar escalamientos.
     */
    List<Supervisor> findByPuedeAprobarEscalamientosTrue();
}
