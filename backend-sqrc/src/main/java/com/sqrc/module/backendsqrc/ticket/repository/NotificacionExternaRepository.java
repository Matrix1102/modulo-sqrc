package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.NotificacionExterna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionExternaRepository extends JpaRepository<NotificacionExterna, Long> {

    /**
     * Obtiene todas las notificaciones externas de un ticket específico.
     * Útil para mostrar el historial de derivaciones en el timeline.
     *
     * @param ticketId ID del ticket
     * @return Lista de notificaciones externas del ticket
     */
    List<NotificacionExterna> findByTicket_IdTicket(Long ticketId);

    /**
     * Obtiene todas las notificaciones externas ordenadas por fecha de envío descendente.
     * Útil para el simulador de área externa que lista todos los tickets derivados.
     *
     * @return Lista de todas las notificaciones externas ordenadas
     */
    List<NotificacionExterna> findAllByOrderByFechaEnvioDesc();
}

