package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.AgentePresencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para AgentePresencial.
 */
@Repository
public interface AgentePresencialRepository extends JpaRepository<AgentePresencial, Long> {

    /**
     * Busca agentes presenciales disponibles (no ocupados).
     */
    List<AgentePresencial> findByEstaOcupadoFalse();

    /**
     * Busca agente presencial por correo.
     */
    Optional<AgentePresencial> findByCorreo(String correo);

    /**
     * Busca agentes presenciales por supervisor.
     */
    List<AgentePresencial> findBySupervisorIdEmpleado(Long supervisorId);
}
