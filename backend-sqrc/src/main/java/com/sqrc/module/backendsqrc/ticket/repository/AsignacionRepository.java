package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {

    /**
     * Obtiene todas las asignaciones de un ticket ordenadas por fecha de inicio descendente
     */
    List<Asignacion> findByTicketIdTicketOrderByFechaInicioDesc(Long ticketId);

    /**
     * Obtiene la asignación activa actual de un ticket (sin fecha fin)
     */
    @Query("SELECT a FROM Asignacion a WHERE a.ticket.idTicket = :ticketId AND a.fechaFin IS NULL")
    Optional<Asignacion> findAsignacionActiva(@Param("ticketId") Long ticketId);

    /**
     * Verifica si existe una asignación activa para un ticket
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Asignacion a WHERE a.ticket.idTicket = :ticketId AND a.fechaFin IS NULL")
    boolean existsAsignacionActiva(@Param("ticketId") Long ticketId);

    /**
     * Obtiene todas las asignaciones de un empleado ordenadas por fecha de inicio descendente.
     * Usado para consultas de desempeño desde otros módulos.
     */
    @Query("SELECT a FROM Asignacion a " +
           "JOIN FETCH a.ticket t " +
           "LEFT JOIN FETCH t.motivo " +
           "LEFT JOIN FETCH t.cliente " +
           "WHERE a.empleado.idEmpleado = :empleadoId " +
           "ORDER BY a.fechaInicio DESC")
    List<Asignacion> findByEmpleadoIdWithTicket(@Param("empleadoId") Long empleadoId);

    /**
     * Obtiene las asignaciones más recientes con tickets (para lista de tickets recientes).
     * Incluye agente, motivo y cliente.
     */
    @Query("SELECT a FROM Asignacion a " +
           "JOIN FETCH a.ticket t " +
           "JOIN FETCH a.empleado e " +
           "LEFT JOIN FETCH t.motivo " +
           "LEFT JOIN FETCH t.cliente " +
           "WHERE t.fechaCreacion BETWEEN :inicio AND :fin " +
           "ORDER BY t.fechaCreacion DESC")
    List<Asignacion> findRecentWithDetails(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    /**
     * Obtiene los IDs de tickets que tienen al menos una asignación del empleado especificado.
     * Optimizado para filtrar tickets por empleado.
     */
    @Query("SELECT DISTINCT a.ticket.idTicket FROM Asignacion a WHERE a.empleado.idEmpleado = :empleadoId")
    List<Long> findTicketIdsByEmpleadoId(@Param("empleadoId") Long empleadoId);

    Optional<Asignacion> findTopByTicket_IdTicketOrderByFechaInicioDesc(Long idTicket);
}


