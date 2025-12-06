package com.sqrc.module.backendsqrc.logs.repository;

import com.sqrc.module.backendsqrc.logs.model.TicketWorkflowLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestionar los logs de flujo de trabajo de tickets.
 */
@Repository
public interface TicketWorkflowLogRepository extends JpaRepository<TicketWorkflowLog, Long> {

    /**
     * Busca todos los logs de un ticket ordenados por fecha
     */
    List<TicketWorkflowLog> findByTicketIdOrderByTimestampDesc(Long ticketId);

    /**
     * Busca logs por acción específica
     */
    List<TicketWorkflowLog> findByActionOrderByTimestampDesc(String action);

    /**
     * Busca logs por empleado origen
     */
    List<TicketWorkflowLog> findByEmpleadoOrigenIdOrderByTimestampDesc(Long empleadoId);

    /**
     * Busca logs por empleado destino
     */
    List<TicketWorkflowLog> findByEmpleadoDestinoIdOrderByTimestampDesc(Long empleadoId);

    /**
     * Busca escalamientos en un período
     */
    @Query("SELECT t FROM TicketWorkflowLog t WHERE t.action = 'ESCALAR' " +
           "AND t.timestamp BETWEEN :start AND :end ORDER BY t.timestamp DESC")
    List<TicketWorkflowLog> findEscalamientosEnPeriodo(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Cuenta transiciones de estado por tipo
     */
    @Query("SELECT t.action, COUNT(t) FROM TicketWorkflowLog t " +
           "WHERE t.timestamp >= :since GROUP BY t.action")
    List<Object[]> countByActionSince(@Param("since") LocalDateTime since);

    /**
     * Busca el historial completo de un ticket
     */
    @Query("SELECT t FROM TicketWorkflowLog t WHERE t.ticketId = :ticketId " +
           "ORDER BY t.timestamp ASC")
    List<TicketWorkflowLog> findHistorialCompleto(@Param("ticketId") Long ticketId);
}
