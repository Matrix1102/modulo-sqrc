package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.BackOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para BackOffice.
 * Nota: Para este proyecto consideramos que todos los empleados están activos.
 */
@Repository
public interface BackOfficeRepository extends JpaRepository<BackOffice, Long> {

    /**
     * Busca BackOffice por correo.
     */
    Optional<BackOffice> findByCorreo(String correo);

    /**
     * Busca BackOffice con menos tickets asignados (para balance de carga).
     * Ordena por cantidad de tickets activos ascendentemente.
     */
    @Query("SELECT bo FROM BackOffice bo LEFT JOIN bo.ticketsAsignados ta WHERE ta.fechaFin IS NULL OR ta IS NULL GROUP BY bo ORDER BY COUNT(ta) ASC")
    List<BackOffice> findBackOfficeConMenosCarga();

    /**
     * Busca BackOffice que pueden derivar tickets.
     */
    List<BackOffice> findByPuedeDerivarTrue();
}
