package com.sqrc.module.backendsqrc.plantillaRespuesta.Repository;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import org.springframework.data.jpa.repository.JpaRepository;



public interface RespuestaRepository extends JpaRepository<RespuestaCliente, Long>{

    // para ver el historial de respuestas de un caso específico
    // List<RespuestaCliente> findByAsignacion_IdAsignacion(Long idAsignacion);
}
