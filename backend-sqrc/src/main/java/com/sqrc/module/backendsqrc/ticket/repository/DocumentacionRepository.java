package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Documentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentacionRepository extends JpaRepository<Documentacion, Integer> {
    
    @Query("SELECT d FROM Documentacion d WHERE d.asignacion.ticket.idTicket = :ticketId")
    List<Documentacion> findByTicketId(@Param("ticketId") Long ticketId);
    
    @Query("SELECT d FROM Documentacion d WHERE d.asignacion.idAsignacion = :asignacionId")
    List<Documentacion> findByAsignacionId(@Param("asignacionId") Long asignacionId);
    
    Optional<Documentacion> findByIdArticuloKB(Integer idArticuloKB);
}
