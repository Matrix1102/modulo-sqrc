/*package com.sqrc.module.backendsqrc.plantillaRespuesta.observer;


import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RespuestaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;
import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketEstadoListener implements IRespuestaObserver {

    private final RespuestaService respuestaService;
    private final AsignacionRepository asignacionRepository;
    private final TicketRepository ticketRepository;

    @PostConstruct
    public void registrarse() {
        respuestaService.agregarObservador(this);
    }

    @Override
    public void actualizar(RespuestaEnviadaEvent evento) {

        if (!evento.isDebeCerrarTicket()) {
            return;
        }

        Asignacion asignacion = asignacionRepository.findById(evento.getIdAsignacion())
                .orElseThrow(() -> new RuntimeException("error en observer"));

         Ticket ticket = ticketRepository.finById(asignacion.getTicket().getId());
         ticket.setEstado("CERRADO");
         ticketRepository.save(ticket);

    }
}*/



