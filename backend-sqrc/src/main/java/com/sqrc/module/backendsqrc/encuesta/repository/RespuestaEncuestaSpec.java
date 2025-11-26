package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion;
import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;

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

            // 2. Filtro por Fecha Inicio
            if (start != null) {
                spec = spec.and((rootQuery, q, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(
                        rootQuery.get("fechaRespuesta").as(LocalDate.class),
                        start));
            }

            // 3. Filtro por Fecha Fin
            if (end != null) {
                spec = spec.and((rootQuery, q, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(
                        rootQuery.get("fechaRespuesta").as(LocalDate.class),
                        end));
            }

            // TODO: Agregar filtro por Agente cuando tengas la relación en el modelo

            return spec.toPredicate(root, query, cb);
        };
    }
}