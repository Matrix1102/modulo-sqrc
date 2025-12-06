package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Documentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentacionRepository extends JpaRepository<Documentacion, Long> {

    // Busca documentación por ID de ticket navegando la relación
    @Query("SELECT d FROM Documentacion d WHERE d.asignacion.ticket.idTicket = :ticketId")
    Optional<Documentacion> findByTicketId(@Param("ticketId") Long ticketId);

    // Verifica si existe al menos una documentación para el ticket (evita NonUniqueResultException)
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Documentacion d WHERE d.asignacion.ticket.idTicket = :ticketId")
    boolean existsByTicketId(@Param("ticketId") Long ticketId);

    // Busca documentación por ID de asignación
    @Query("SELECT d FROM Documentacion d WHERE d.asignacion.idAsignacion = :asignacionId")
    Optional<Documentacion> findByAsignacionId(@Param("asignacionId") Long asignacionId);
}