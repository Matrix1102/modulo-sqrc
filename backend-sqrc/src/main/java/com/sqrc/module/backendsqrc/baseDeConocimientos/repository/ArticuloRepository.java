package com.sqrc.module.backendsqrc.baseDeConocimientos.repository;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Articulo.
 * Proporciona métodos de acceso a datos y consultas personalizadas.
 */
@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Integer> {

        /**
         * Busca un artículo por su código único.
         */
        Optional<Articulo> findByCodigo(String codigo);

        /**
         * Verifica si existe un artículo con el código dado.
         */
        boolean existsByCodigo(String codigo);

        /**
         * Busca artículos por etiqueta/categoría.
         */
        List<Articulo> findByEtiqueta(Etiqueta etiqueta);

        /**
         * Busca artículos por visibilidad.
         */
        List<Articulo> findByVisibilidad(Visibilidad visibilidad);

        /**
         * Busca artículos por tipo de caso.
         */
        List<Articulo> findByTipoCaso(TipoCaso tipoCaso);

        /**
         * Busca artículos por ID del propietario (creador).
         */
        List<Articulo> findByPropietarioIdEmpleado(Long idEmpleado);

        /**
         * Busca artículos vigentes en una fecha específica.
         */
        @Query("SELECT a FROM Articulo a WHERE " +
                        "(a.vigenteDesde IS NULL OR a.vigenteDesde <= :fecha) AND " +
                        "(a.vigenteHasta IS NULL OR a.vigenteHasta >= :fecha)")
        List<Articulo> findVigentesEnFecha(@Param("fecha") LocalDateTime fecha);

        /**
         * Búsqueda de artículos por texto en título o resumen.
         */
        @Query("SELECT a FROM Articulo a WHERE " +
                        "LOWER(a.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) OR " +
                        "LOWER(a.resumen) LIKE LOWER(CONCAT('%', :texto, '%'))")
        List<Articulo> buscarPorTexto(@Param("texto") String texto);

        /**
         * Búsqueda paginada de artículos con filtros múltiples.
         */
        @Query("SELECT DISTINCT a FROM Articulo a " +
                        "LEFT JOIN a.versiones v " +
                        "WHERE (:etiqueta IS NULL OR a.etiqueta = :etiqueta) " +
                        "AND (:visibilidad IS NULL OR a.visibilidad = :visibilidad) " +
                        "AND (:tipoCaso IS NULL OR a.tipoCaso = :tipoCaso OR a.tipoCaso = 'TODOS') " +
                        "AND (:texto IS NULL OR LOWER(a.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) " +
                        "     OR LOWER(a.resumen) LIKE LOWER(CONCAT('%', :texto, '%')))")
        Page<Articulo> buscarConFiltros(
                        @Param("etiqueta") Etiqueta etiqueta,
                        @Param("visibilidad") Visibilidad visibilidad,
                        @Param("tipoCaso") TipoCaso tipoCaso,
                        @Param("texto") String texto,
                        Pageable pageable);

        /**
         * Encuentra artículos con versión vigente publicada.
         */
        @Query("SELECT DISTINCT a FROM Articulo a " +
                        "JOIN a.versiones v " +
                        "WHERE v.esVigente = true " +
                        "AND v.estadoPropuesta = 'PUBLICADO' " +
                        "AND (:visibilidad IS NULL OR a.visibilidad = :visibilidad)")
        List<Articulo> findArticulosPublicados(@Param("visibilidad") Visibilidad visibilidad);

        /**
         * Cuenta artículos por etiqueta.
         */
        @Query("SELECT a.etiqueta, COUNT(a) FROM Articulo a GROUP BY a.etiqueta")
        List<Object[]> contarPorEtiqueta();

        /**
         * Busca artículos deprecados (vigencia expirada).
         */
        @Query("SELECT a FROM Articulo a WHERE a.vigenteHasta < :fecha")
        List<Articulo> findArticulosDeprecados(@Param("fecha") LocalDateTime fecha);

        /**
         * Artículos más populares basados en feedback positivo.
         */
        @Query("SELECT a FROM Articulo a " +
                        "JOIN a.versiones v " +
                        "JOIN v.feedbacks f " +
                        "WHERE f.util = true " +
                        "GROUP BY a " +
                        "ORDER BY COUNT(f) DESC")
        Page<Articulo> findMasPopulares(Pageable pageable);

        /**
         * Artículos propuestos pendientes de revisión (borradores).
         */
        @Query("SELECT DISTINCT a FROM Articulo a " +
                        "JOIN a.versiones v " +
                        "WHERE v.estadoPropuesta = 'BORRADOR' " +
                        "AND a.propietario.idEmpleado = :idEmpleado")
        List<Articulo> findBorradoresPorEmpleado(@Param("idEmpleado") Long idEmpleado);

        /**
         * Búsqueda de sugerencias de artículos activos por palabras clave.
         * Busca en título, resumen y tags, ordenando por relevancia (coincidencias) y
         * feedbacks positivos.
         * Solo retorna artículos con versión vigente publicada y dentro de fechas de
         * vigencia.
         */
        @Query("SELECT DISTINCT a FROM Articulo a " +
                        "JOIN a.versiones v " +
                        "LEFT JOIN v.feedbacks f " +
                        "WHERE v.esVigente = true " +
                        "AND v.estadoPropuesta = 'PUBLICADO' " +
                        "AND (a.vigenteDesde IS NULL OR a.vigenteDesde <= :ahora) " +
                        "AND (a.vigenteHasta IS NULL OR a.vigenteHasta >= :ahora) " +
                        "AND (:visibilidad IS NULL OR a.visibilidad = :visibilidad OR a.visibilidad = 'AGENTE') " +
                        "AND (LOWER(a.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) " +
                        "     OR LOWER(a.resumen) LIKE LOWER(CONCAT('%', :texto, '%')) " +
                        "     OR LOWER(a.tags) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
                        "GROUP BY a.idArticulo " +
                        "ORDER BY " +
                        "  CASE WHEN LOWER(a.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) THEN 3 ELSE 0 END + " +
                        "  CASE WHEN LOWER(a.resumen) LIKE LOWER(CONCAT('%', :texto, '%')) THEN 2 ELSE 0 END + " +
                        "  CASE WHEN LOWER(a.tags) LIKE LOWER(CONCAT('%', :texto, '%')) THEN 1 ELSE 0 END DESC, " +
                        "  COUNT(CASE WHEN f.util = true THEN 1 END) DESC")
        List<Articulo> buscarSugerenciasActivas(
                        @Param("texto") String texto,
                        @Param("visibilidad") Visibilidad visibilidad,
                        @Param("ahora") LocalDateTime ahora,
                        Pageable pageable);
}
