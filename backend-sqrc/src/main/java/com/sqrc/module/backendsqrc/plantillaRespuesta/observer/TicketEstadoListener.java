package com.sqrc.module.backendsqrc.plantillaRespuesta.observer;


import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RespuestaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketEstadoListener implements IRespuestaObserver {

    private final RespuestaService respuestaService;


    @PostConstruct
    public void registrarse() {
        respuestaService.agregarObservador(this);
        System.out.println("TicketEstadoListener se ha suscrito a RespuestaService.");
    }

    @Override
    public void actualizar(RespuestaEnviadaEvent evento) {
        // Aquí llega el aviso manual
        System.out.println(" Recibido evento para asignación ID: " + evento.getIdAsignacion());

        if (!evento.isDebeCerrarTicket()) {
            return;
        }

        System.out.println("cerrando ticket en BD...");
        /*
        * * CÓDIGO REAL (Descomentar cuando tengas el repositorio):
        Asignacion asignacion = asignacionRepository.findById(event.getIdAsignacion())
                .orElseThrow(() -> new RuntimeException("Error en Observer"));
        todo lo de aca tendira que ser con el ticket, la asignacion gui al ticket
        asignacion.setEstado(Estado.ATENDIDO);
        asignacionRepository.save(asignacion);
        */
    }
}
