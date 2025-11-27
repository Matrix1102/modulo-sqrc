package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
@Component
@RequiredArgsConstructor
public class ValidarEstadoTicket extends ValidadorRespuesta{

    // private final AsignacionRepository asignacionRepository;

    @Override
    public void validar(EnviarRespuestaRequestDTO request) {
        System.out.println("⛓ [CHAIN] 1. Verificando si el ticket permite respuesta...");

        /* LÓGICA REAL:
        var asignacion = asignacionRepository.findById(request.idAsignacion()).orElseThrow();
        if (asignacion.getEstado().equals("CERRADO")) {
            throw new RuntimeException("⛔ ERROR: No puedes responder un ticket que ya está CERRADO.");
        }
        */

        // Si todo está bien, pasamos la pelota al siguiente
        siguiente(request);
    }
}
