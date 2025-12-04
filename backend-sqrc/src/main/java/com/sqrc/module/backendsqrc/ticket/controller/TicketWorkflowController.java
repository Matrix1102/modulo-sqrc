package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.DerivarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.EscalarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.RespuestaDerivacionDTO;
import com.sqrc.module.backendsqrc.ticket.facade.TicketWorkflowFacade;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestionar el flujo de trabajo de tickets.
 * Maneja operaciones de escalamiento, derivación y respuestas externas.
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketWorkflowController {

    private final TicketWorkflowFacade ticketWorkflowFacade;

    /**
     * Escala un ticket al área de Backoffice.
     *
     * @param id ID del ticket a escalar
     * @param request DTO con información del escalamiento
     * @return Respuesta HTTP 200 si se escaló exitosamente
     */
    @PostMapping("/{id}/escalar")
    public ResponseEntity<String> escalarTicket(
            @PathVariable Long id,
            @Valid @RequestBody EscalarRequestDTO request) {

        ticketWorkflowFacade.escalarTicket(id, request);

        return ResponseEntity.ok("Ticket #" + id + " escalado exitosamente a Backoffice");
    }

    /**
     * Deriva un ticket a un área externa (TI, Ventas, etc.).
     *
     * @param id ID del ticket a derivar
     * @param request DTO con información de la derivación
     * @return Respuesta HTTP 200 si se derivó exitosamente
     */
    @PostMapping("/{id}/derivar")
    public ResponseEntity<String> derivarTicket(
            @PathVariable Long id,
            @Valid @RequestBody DerivarRequestDTO request) {

        ticketWorkflowFacade.derivarTicket(id, request);

        return ResponseEntity.ok("Ticket #" + id + " derivado exitosamente al área ID: " + request.getAreaDestinoId());
    }

    /**
     * Registra la respuesta recibida de un área externa.
     *
     * @param id ID del ticket que recibe la respuesta
     * @param respuesta DTO con la respuesta externa
     * @return Respuesta HTTP 200 si se registró exitosamente
     */
    @PostMapping("/{id}/respuesta-externa")
    public ResponseEntity<String> registrarRespuestaExterna(
            @PathVariable Long id,
            @Valid @RequestBody RespuestaDerivacionDTO respuesta) {

        ticketWorkflowFacade.registrarRespuestaExterna(id, respuesta);

        String mensaje = respuesta.getSolucionado()
                ? "Respuesta registrada. Ticket marcado como resuelto."
                : "Respuesta registrada. Ticket requiere seguimiento adicional.";

        return ResponseEntity.ok(mensaje);
    }
}

