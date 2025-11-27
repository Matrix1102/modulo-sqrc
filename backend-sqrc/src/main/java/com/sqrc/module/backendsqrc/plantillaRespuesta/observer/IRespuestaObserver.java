package com.sqrc.module.backendsqrc.plantillaRespuesta.observer;

import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;

public interface IRespuestaObserver {

    void actualizar(RespuestaEnviadaEvent evento);
}
