package com.sqrc.module.backendsqrc.baseDeConocimientos.repository;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad ArticuloVersion.
 * Gestiona las versiones de los artículos de conocimiento.
 */
@Repository
public interface ArticuloVersionRepository extends JpaRepository<ArticuloVersion, Integer> {

    /**
     * Busca todas las versiones de un artículo ordenadas por número de versión
     * descendente.
     */
    List<ArticuloVersion> findByArticuloIdArticuloOrderByNumeroVersionDesc(Integer idArticulo);

    /**
     * Busca la versión vigente de un artículo.
     */
    Optional<ArticuloVersion> findByArticuloIdArticuloAndEsVigenteTrue(Integer idArticulo);

    /**
     * Busca una versión específica de un artículo.
     */
    Optional<ArticuloVersion> findByArticuloIdArticuloAndNumeroVersion(Integer idArticulo, Integer numeroVersion);

    /**
     * Busca versiones por estado.
     */
    List<ArticuloVersion> findByEstadoPropuesta(EstadoArticulo estado);

    /**
     * Busca versiones por origen.
     */
    List<ArticuloVersion> findByOrigen(OrigenVersion origen);

    /**
     * Busca versiones creadas por un empleado específico.
     */
    List<ArticuloVersion> findByCreadoPorIdEmpleado(Long idEmpleado);

    /**
     * Busca versiones derivadas de un ticket específico.
     */
    List<ArticuloVersion> findByTicketOrigenIdTicket(Long idTicket);

    /**
     * Cuenta las versiones de un artículo.
     */
    @Query("SELECT COUNT(v) FROM ArticuloVersion v WHERE v.articulo.idArticulo = :idArticulo")
    Long contarVersionesPorArticulo(@Param("idArticulo") Integer idArticulo);

    /**
     * Obtiene la última versión de un artículo.
     */
    @Query("SELECT v FROM ArticuloVersion v " +
            "WHERE v.articulo.idArticulo = :idArticulo " +
            "ORDER BY v.numeroVersion DESC " +
            "LIMIT 1")
    Optional<ArticuloVersion> findUltimaVersion(@Param("idArticulo") Integer idArticulo);

    /**
     * Desmarca todas las versiones vigentes de un artículo.
     */
    @Modifying
    @Query("UPDATE ArticuloVersion v SET v.esVigente = false " +
            "WHERE v.articulo.idArticulo = :idArticulo")
    void desmarcarVersionesVigentes(@Param("idArticulo") Integer idArticulo);

    /**
     * Busca versiones en estado borrador paginadas.
     */
    @Query("SELECT v FROM ArticuloVersion v " +
            "WHERE v.estadoPropuesta = 'BORRADOR' " +
            "ORDER BY v.creadoEn DESC")
    Page<ArticuloVersion> findBorradores(Pageable pageable);

    /**
     * Busca versiones pendientes de revisión por un supervisor.
     */
    @Query("SELECT v FROM ArticuloVersion v " +
            "WHERE v.estadoPropuesta = 'BORRADOR' " +
            "AND v.articulo.propietario.idEmpleado = :idSupervisor")
    List<ArticuloVersion> findPendientesRevision(@Param("idSupervisor") Long idSupervisor);

    /**
     * Estadísticas de versiones por estado.
     */
    @Query("SELECT v.estadoPropuesta, COUNT(v) FROM ArticuloVersion v GROUP BY v.estadoPropuesta")
    List<Object[]> contarPorEstado();

    /**
     * Búsqueda de versiones por contenido.
     */
    @Query("SELECT v FROM ArticuloVersion v " +
            "WHERE v.esVigente = true " +
            "AND LOWER(v.contenido) LIKE LOWER(CONCAT('%', :texto, '%'))")
    List<ArticuloVersion> buscarEnContenido(@Param("texto") String texto);
}
