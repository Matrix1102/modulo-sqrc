package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Agente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Agente (abstracta).
 * Permite consultar tanto AgenteLlamada como AgentePresencial.
 */
@Repository
public interface AgenteRepository extends JpaRepository<Agente, Long> {

    /**
     * Busca agentes disponibles (no ocupados) de un supervisor.
     */
    @Query("SELECT a FROM Agente a WHERE a.supervisor.idEmpleado = :supervisorId AND a.estaOcupado = false")
    List<Agente> findAgentesDisponiblesPorSupervisor(@Param("supervisorId") Long supervisorId);

    /**
     * Busca agentes por supervisor.
     */
    List<Agente> findBySupervisorIdEmpleado(Long supervisorId);

    /**
     * Busca un agente por correo.
     */
    Optional<Agente> findByCorreo(String correo);

    /**
     * Busca agentes disponibles.
     */
    List<Agente> findByEstaOcupadoFalse();
}
