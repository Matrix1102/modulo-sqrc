package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.model.OrigenTicket;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.model.TipoTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Ticket findById(long id);

    // Find tickets whose creation timestamp is between start and end (inclusive)
    List<Ticket> findByFechaCreacionBetween(LocalDateTime start, LocalDateTime end);

    // Find tickets whose closing timestamp is between start and end (inclusive)
    List<Ticket> findByFechaCierreBetween(LocalDateTime start, LocalDateTime end);

    // Find tickets by cliente ID
    List<Ticket> findByClienteIdCliente(Integer clienteId);

    // Find tickets by estado
    List<Ticket> findByEstadoIn(List<EstadoTicket> estados);

    // Find tickets by tipo
    List<Ticket> findByTipoTicket(TipoTicket tipoTicket);

    // Find tickets by origen
    List<Ticket> findByOrigen(OrigenTicket origen);

    // Query compleja para buscar tickets con joins
    @Query("SELECT DISTINCT t FROM Ticket t " +
           "LEFT JOIN FETCH t.motivo " +
           "LEFT JOIN FETCH t.asignaciones a " +
           "LEFT JOIN FETCH a.empleado " +
           "WHERE t.cliente.idCliente = :clienteId " +
           "ORDER BY t.fechaCreacion DESC")
    List<Ticket> findByClienteIdWithDetails(@Param("clienteId") Integer clienteId);

    // Query para obtener ticket con todos los detalles
    @Query("SELECT DISTINCT t FROM Ticket t " +
           "LEFT JOIN FETCH t.motivo " +
           "LEFT JOIN FETCH t.asignaciones a " +
           "LEFT JOIN FETCH a.empleado " +
           "WHERE t.idTicket = :ticketId")
    Ticket findByIdWithDetails(@Param("ticketId") Long ticketId);

    // Convenience defaults accepting a LocalDate (day) to match existing batch expectations
    default List<Ticket> findByFechaCreacion(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return findByFechaCreacionBetween(start, end);
    }

    default List<Ticket> findByFechaCierre(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return findByFechaCierreBetween(start, end);
    }
}
