package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion;
import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class RespuestaEncuestaSpec {

    public static Specification<RespuestaEncuesta> filtrarPorCriterios(
            String alcance,
            String agenteId,
            LocalDate start,
            LocalDate end) {
        return (root, query, cb) -> {
            Specification<RespuestaEncuesta> spec = Specification.where(null);

            // 1. Filtro por Alcance (SERVICIO / AGENTE)
            if (alcance != null && !alcance.isEmpty()) {
                // Navegamos: Respuesta -> Encuesta -> Alcance
                spec = spec.and((rootQuery, q, criteriaBuilder) -> criteriaBuilder.equal(
                        rootQuery.get("encuesta").get("alcanceEvaluacion"),
                        AlcanceEvaluacion.valueOf(alcance.toUpperCase())));
            }

            // 2. Filtro por Fecha Inicio/Fin (convertimos a LocalDateTime para comparar correctamente)
            LocalDateTime startDt = (start != null) ? start.atStartOfDay() : null;
            LocalDateTime endDt = (end != null) ? end.atTime(LocalTime.MAX) : null;

            if (startDt != null) {
                spec = spec.and((rootQuery, q, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(
                        rootQuery.get("fechaRespuesta").as(LocalDateTime.class),
                        startDt));
            }

            if (endDt != null) {
                spec = spec.and((rootQuery, q, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(
                        rootQuery.get("fechaRespuesta").as(LocalDateTime.class),
                        endDt));
            }

            // TODO: Agregar filtro por Agente cuando tengas la relación en el modelo

            return spec.toPredicate(root, query, cb);
        };
    }
}