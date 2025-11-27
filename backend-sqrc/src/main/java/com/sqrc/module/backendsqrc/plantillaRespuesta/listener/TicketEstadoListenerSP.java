package com.sqrc.module.backendsqrc.plantillaRespuesta.listener;

import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEventSP;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TicketEstadoListenerSP {

    // private final AsignacionRepository asignacionRepository; // <-- Inyectarás esto

    //indica que el meotdo debe ejecutarse automaticamente
    @EventListener
    public void alEnviarRespuesta(RespuestaEnviadaEventSP event) {

        //validamos si debemos actuar
        if (!event.isDebeCerrarTicket()) {
            System.out.println("   -> El evento indica NO cerrar el ticket. Ignorando...");
            return;
        }

        //si es true ejecutamos la lógica
        System.out.println("ID ticket: " + event.getIdAsignacion()); //aca faltaria poner event.getIdAsignacion().getTicket()
        System.out.println(" actualizando estad en bd");

        /* CÓDIGO REAL (Descomentar cuando tengas el repositorio):
        Asignacion asignacion = asignacionRepository.findById(event.getIdAsignacion())
                .orElseThrow(() -> new RuntimeException("Error en Observer"));
        //todo lo de aca tendira que ser con el ticket, la asignacion gui al ticket
        asignacion.setEstado(Estado.ATENDIDO);
        asignacionRepository.save(asignacion);
        */
    }
}
