package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.EstadoLlamada;
import com.sqrc.module.backendsqrc.ticket.model.Llamada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Llamada.
 */
@Repository
public interface LlamadaRepository extends JpaRepository<Llamada, Long> {

    /**
     * Busca llamadas por estado.
     */
    List<Llamada> findByEstado(EstadoLlamada estado);

    /**
     * Busca llamadas de un empleado específico.
     */
    List<Llamada> findByEmpleadoIdEmpleado(Long empleadoId);

    /**
     * Busca la llamada asociada a un ticket.
     */
    Optional<Llamada> findByTicketIdTicket(Long ticketId);

    /**
     * Verifica si un ticket ya tiene una llamada asociada.
     */
    boolean existsByTicketIdTicket(Long ticketId);

    /**
     * Busca llamadas sin ticket asignado (disponibles para asociar).
     */
    @Query("SELECT l FROM Llamada l WHERE l.ticket IS NULL AND l.empleado.idEmpleado = :empleadoId")
    List<Llamada> findLlamadasSinTicketPorEmpleado(@Param("empleadoId") Long empleadoId);

    /**
     * Busca llamadas en un rango de fechas.
     */
    List<Llamada> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Busca llamadas por número de origen.
     */
    List<Llamada> findByNumeroOrigen(String numeroOrigen);
}
