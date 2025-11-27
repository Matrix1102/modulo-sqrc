package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class ValidarDestinatario extends ValidadorRespuesta{
    @Override
    public void validar(EnviarRespuestaRequestDTO request) {
        System.out.println("chain 2. verificando destinatario");

        String correo = request.correoDestino();

        // Validación simple
        if (correo == null || correo.isBlank() || !correo.contains("@")) {
            throw new RuntimeException("correo de destino es inválido");
        }

        // si esta bien se pasa al siugiente eslavon
        siguiente(request);
    }
}
