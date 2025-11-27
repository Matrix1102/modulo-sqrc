package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PlantillaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ValidarPlantillaActiva extends ValidadorRespuesta {

    private final PlantillaService plantillaService;

    @Override
    public void validar(EnviarRespuestaRequestDTO request) {
        System.out.println("verificando vigencia de la plantilla");

        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());

        if (Boolean.FALSE.equals(plantilla.isActivo())) {
            throw new RuntimeException("La plantilla seleccionada está inactiva y no puede usarse");
        }

        siguiente(request);
    }
}
