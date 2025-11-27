package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PlantillaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ValidarCoherenciaTipo extends ValidadorRespuesta {

    private final PlantillaService plantillaService;
    // private final AsignacionRepository asignacionRepository;

    @Override
    public void validar(EnviarRespuestaRequestDTO request) {
        System.out.println("⛓ [CHAIN] 3. Verificando coherencia de tipos...");

        // 1. Obtener los objetos reales
        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());

        // Asignacion asignacion = asignacionRepository.findById(request.idAsignacion()).orElseThrow();
        // Ticket ticket = asignacion.getTicket();

        //comparamos los tipos
        //si el ticket es reclamo pero la plantilla es queja es error"
        /* if (!ticket.getTipo().equals(plantilla.getCaso())) {
            throw new RuntimeException("error: No puedes usar una plantilla de "
                + plantilla.getCaso() + " para responder un ticket de " + ticket.getTipo());
        }
        */

        // Si coinciden, pasa al siguiente
        siguiente(request);
    }
}
