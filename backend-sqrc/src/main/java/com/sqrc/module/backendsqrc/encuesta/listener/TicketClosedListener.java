package com.sqrc.module.backendsqrc.encuesta.listener;

import com.sqrc.module.backendsqrc.encuesta.event.TicketClosedEvent;
import com.sqrc.module.backendsqrc.encuesta.service.EncuestaService;
import com.sqrc.module.backendsqrc.vista360.service.Vista360Service;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener que reacciona cuando se cierra un ticket y envía la encuesta asociada.
 * Implementa la opción A: envío simple vía `EncuestaService.enviarEncuestaManual`.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TicketClosedListener {

    private final EncuestaService encuestaService;
    private final Vista360Service vista360Service;

    @EventListener
    @Transactional
    public void onTicketClosed(TicketClosedEvent event) {
        log.info("TicketClosedEvent received: ticketId={} encuestaId={} clienteId={}", event.ticketId(), event.encuestaId(), event.clienteId());

        if (event.encuestaId() == null) {
            log.warn("No encuestaId en el evento; no se puede enviar encuesta automáticamente. ticketId={}", event.ticketId());
            return;
        }

        // Resolver correo del cliente si se proporcionó clienteId
        String correoDestino = null;
        if (event.clienteId() != null) {
            try {
                ClienteBasicoDTO cliente = vista360Service.obtenerClientePorId(event.clienteId());
                correoDestino = cliente.getCorreo();
            } catch (Exception ex) {
                log.warn("No se pudo resolver correo para clienteId={} - {}", event.clienteId(), ex.getMessage());
            }
        }

        if (correoDestino == null || correoDestino.isBlank()) {
            log.warn("No se encontró correo de destino para ticketId={} (clienteId={}), abortando envío.", event.ticketId(), event.clienteId());
            return;
        }

        // Evitar enviar si la encuesta ya fue respondida
        try {
            boolean responded = encuestaService.isEncuestaRespondida(event.encuestaId().toString());
            if (responded) {
                log.info("Encuesta {} ya fue respondida; no se enviará.", event.encuestaId());
                return;
            }
        } catch (Exception e) {
            log.warn("Error comprobando estado de encuesta {}: {}", event.encuestaId(), e.getMessage());
            // continuamos intentando el envío (no bloqueamos) — opcional
        }

        // Enviar encuesta (attachPdf=false por defecto)
        try {
            encuestaService.enviarEncuestaManual(event.encuestaId().toString(), correoDestino, "Por favor complete esta encuesta", false);
            log.info("Envió de encuesta {} encolado/ejecutado para correo={}", event.encuestaId(), correoDestino);
        } catch (Exception ex) {
            log.error("Fallo al enviar encuesta {}: {}", event.encuestaId(), ex.getMessage(), ex);
        }
    }
}
