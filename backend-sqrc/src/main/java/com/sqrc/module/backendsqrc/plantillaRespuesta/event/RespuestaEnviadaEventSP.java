package com.sqrc.module.backendsqrc.plantillaRespuesta.event;

import org.springframework.context.ApplicationEvent;
import lombok.Getter;


@Getter
public class RespuestaEnviadaEventSP extends ApplicationEvent {
    // El dato que necesita el observador para saber qué ticket cerrar
    private final Long idAsignacion;
    private final boolean debeCerrarTicket; // El "flag" de decisión

    //source es el objeto que lanzó el evneto
    public RespuestaEnviadaEventSP(Object source, Long idAsignacion, boolean debeCerrarTicket) {
        super(source); //pasa el 'source' a la clase padre de Spring
        this.idAsignacion = idAsignacion;
        this.debeCerrarTicket = debeCerrarTicket;
    }
}
