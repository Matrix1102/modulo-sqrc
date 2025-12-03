package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}


