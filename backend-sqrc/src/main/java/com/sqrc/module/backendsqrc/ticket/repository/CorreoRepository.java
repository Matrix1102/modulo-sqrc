package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Correo;
import com.sqrc.module.backendsqrc.ticket.model.TipoCorreo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Correo.
 * Permite gestionar los correos enviados durante el ciclo de vida de un ticket.
 */
@Repository
public interface CorreoRepository extends JpaRepository<Correo, Long> {

    /**
     * Encuentra todos los correos asociados a una asignación específica
     *
     * @param idAsignacion ID de la asignación
     * @return Lista de correos
     */
    List<Correo> findByAsignacion_IdAsignacion(Long idAsignacion);

    /**
     * Encuentra todos los correos de un tipo específico
     *
     * @param tipoCorreo Tipo de correo a buscar
     * @return Lista de correos del tipo especificado
     */
    List<Correo> findByTipoCorreo(TipoCorreo tipoCorreo);

    /**
     * Encuentra todos los correos asociados a un ticket específico a través de sus asignaciones
     *
     * @param ticketId ID del ticket
     * @return Lista de correos
     */
    List<Correo> findByAsignacion_Ticket_IdTicket(Long ticketId);
}

