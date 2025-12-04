package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.AgenteLlamada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para AgenteLlamada.
 */
@Repository
public interface AgenteLlamadaRepository extends JpaRepository<AgenteLlamada, Long> {

    /**
     * Busca agentes de llamada disponibles (no ocupados).
     */
    List<AgenteLlamada> findByEstaOcupadoFalse();

    /**
     * Busca agente de llamada por correo.
     */
    Optional<AgenteLlamada> findByCorreo(String correo);

    /**
     * Busca agentes de llamada por supervisor.
     */
    List<AgenteLlamada> findBySupervisorIdEmpleado(Long supervisorId);

    /**
     * Busca agentes de llamada con al menos una llamada activa.
     */
    @Query("SELECT a FROM AgenteLlamada a WHERE a.llamadasActivas > 0")
    List<AgenteLlamada> findAgentesConLlamadaActiva();

    /**
     * Busca agentes de llamada que pueden aceptar más llamadas (menos del máximo).
     */
    @Query("SELECT a FROM AgenteLlamada a WHERE a.llamadasActivas < :maxLlamadas")
    List<AgenteLlamada> findAgentesDisponiblesParaLlamadas(int maxLlamadas);

    /**
     * Busca agentes de llamada disponibles para nuevas llamadas (con capacidad).
     */
    @Query("SELECT a FROM AgenteLlamada a WHERE a.llamadasActivas < 2 AND a.estaOcupado = false")
    List<AgenteLlamada> findAgentesDisponibles();
}
