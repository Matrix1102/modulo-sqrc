package com.sqrc.module.backendsqrc.plantillaRespuesta.Repository;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RespuestaRepository extends JpaRepository<RespuestaCliente, Long>{

    // para ver el historial de respuestas de un caso específico
    // List<RespuestaCliente> findByAsignacion_IdAsignacion(Long idAsignacion);

    /**
     * Busca respuestas MANUALES enviadas al cliente por ID de ticket.
     * Navega: RespuestaCliente -> Asignacion -> Ticket
     * Solo incluye respuestas de tipo MANUAL (enviadas por agentes).
     */
    @Query("SELECT r FROM RespuestaCliente r WHERE r.asignacion.ticket.idTicket = :ticketId AND r.tipoRespuesta = 'MANUAL'")
    List<RespuestaCliente> findByTicketId(@Param("ticketId") Long ticketId);

    /**
     * Verifica si existe al menos una respuesta MANUAL enviada para el ticket.
     * Excluye las confirmaciones automáticas del sistema.
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM RespuestaCliente r WHERE r.asignacion.ticket.idTicket = :ticketId AND r.tipoRespuesta = 'MANUAL'")
    boolean existsByTicketId(@Param("ticketId") Long ticketId);
}
