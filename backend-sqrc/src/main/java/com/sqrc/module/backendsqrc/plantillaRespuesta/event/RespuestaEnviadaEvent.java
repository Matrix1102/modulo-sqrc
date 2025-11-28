package com.sqrc.module.backendsqrc.plantillaRespuesta.event;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class RespuestaEnviadaEvent {
    private final Long idAsignacion;
    private final boolean debeCerrarTicket;
}

