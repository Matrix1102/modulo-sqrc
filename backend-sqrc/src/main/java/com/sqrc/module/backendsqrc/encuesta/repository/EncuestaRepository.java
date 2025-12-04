package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Long>, JpaSpecificationExecutor<Encuesta> {
    List<Encuesta> findByFechaEnvioBetween(LocalDateTime inicio, LocalDateTime fin);

    org.springframework.data.domain.Page<Encuesta> findByEstadoEncuesta(
            com.sqrc.module.backendsqrc.encuesta.model.EstadoEncuesta estado,
            org.springframework.data.domain.Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Encuesta e where e.idEncuesta = :id")
    Optional<Encuesta> findByIdForUpdate(@Param("id") Long id);

    /**
     * Carga la encuesta con su plantilla y preguntas para ejecución.
     * Usa JOIN FETCH para evitar problemas de lazy loading.
     */
    @Query("SELECT e FROM Encuesta e " +
           "LEFT JOIN FETCH e.plantilla p " +
           "LEFT JOIN FETCH p.preguntas " +
           "LEFT JOIN FETCH e.agente " +
           "LEFT JOIN FETCH e.cliente " +
           "WHERE e.idEncuesta = :id")
    Optional<Encuesta> findByIdWithPlantillaAndPreguntas(@Param("id") Long id);

    @Query(value = "SELECT AVG(re.calificacion) FROM encuestas e JOIN respuestas_encuesta re ON e.id_encuesta = re.encuesta_id WHERE e.cliente_id = :clienteId", nativeQuery = true)
    Double findPromedioCalificacionByClienteId(@Param("clienteId") Integer clienteId);
}