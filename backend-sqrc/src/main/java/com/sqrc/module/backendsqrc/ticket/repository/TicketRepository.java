package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Ticket findById(long id);

    // Find tickets whose creation timestamp is between start and end (inclusive)
    List<Ticket> findByFechaCreacionBetween(LocalDateTime start, LocalDateTime end);

    // Find tickets whose closing timestamp is between start and end (inclusive)
    List<Ticket> findByFechaCierreBetween(LocalDateTime start, LocalDateTime end);

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
