package com.sqrc.module.backendsqrc.baseDeConocimientos.repository;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.FeedbackArticulo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad FeedbackArticulo.
 * Gestiona los feedbacks de los artículos de conocimiento.
 */
@Repository
public interface FeedbackArticuloRepository extends JpaRepository<FeedbackArticulo, Integer> {

    /**
     * Busca feedbacks de una versión específica.
     */
    List<FeedbackArticulo> findByArticuloVersionIdArticuloVersion(Integer idVersion);

    /**
     * Busca feedbacks dados por un empleado.
     */
    List<FeedbackArticulo> findByEmpleadoIdEmpleado(Long idEmpleado);

    /**
     * Verifica si un empleado ya dio feedback a una versión.
     */
    boolean existsByArticuloVersionIdArticuloVersionAndEmpleadoIdEmpleado(
            Integer idVersion, Long idEmpleado);

    /**
     * Busca feedback de un empleado en una versión específica.
     */
    Optional<FeedbackArticulo> findByArticuloVersionIdArticuloVersionAndEmpleadoIdEmpleado(
            Integer idVersion, Long idEmpleado);

    /**
     * Cuenta feedbacks útiles de una versión.
     */
    @Query("SELECT COUNT(f) FROM FeedbackArticulo f " +
            "WHERE f.articuloVersion.idArticuloVersion = :idVersion " +
            "AND f.util = true")
    Long contarFeedbacksUtiles(@Param("idVersion") Integer idVersion);

    /**
     * Cuenta feedbacks no útiles de una versión.
     */
    @Query("SELECT COUNT(f) FROM FeedbackArticulo f " +
            "WHERE f.articuloVersion.idArticuloVersion = :idVersion " +
            "AND f.util = false")
    Long contarFeedbacksNoUtiles(@Param("idVersion") Integer idVersion);

    /**
     * Calcula la calificación promedio de una versión.
     */
    @Query("SELECT AVG(f.calificacion) FROM FeedbackArticulo f " +
            "WHERE f.articuloVersion.idArticuloVersion = :idVersion " +
            "AND f.calificacion IS NOT NULL")
    Double calcularCalificacionPromedio(@Param("idVersion") Integer idVersion);

    /**
     * Obtiene estadísticas de feedback por versión.
     */
    @Query("SELECT f.articuloVersion.idArticuloVersion, " +
            "COUNT(f), " +
            "SUM(CASE WHEN f.util = true THEN 1 ELSE 0 END), " +
            "AVG(f.calificacion) " +
            "FROM FeedbackArticulo f " +
            "GROUP BY f.articuloVersion.idArticuloVersion")
    List<Object[]> obtenerEstadisticasPorVersion();

    /**
     * Busca feedbacks con comentarios.
     */
    @Query("SELECT f FROM FeedbackArticulo f " +
            "WHERE f.articuloVersion.idArticuloVersion = :idVersion " +
            "AND f.comentario IS NOT NULL AND f.comentario != ''")
    List<FeedbackArticulo> findConComentarios(@Param("idVersion") Integer idVersion);

    /**
     * Paginación de feedbacks de un artículo (todas las versiones).
     */
    @Query("SELECT f FROM FeedbackArticulo f " +
            "WHERE f.articuloVersion.articulo.idArticulo = :idArticulo " +
            "ORDER BY f.creadoEn DESC")
    Page<FeedbackArticulo> findByArticulo(@Param("idArticulo") Integer idArticulo, Pageable pageable);

    /**
     * Feedbacks recientes.
     */
    @Query("SELECT f FROM FeedbackArticulo f ORDER BY f.creadoEn DESC")
    Page<FeedbackArticulo> findRecientes(Pageable pageable);
}
