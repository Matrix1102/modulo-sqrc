package com.sqrc.module.backendsqrc.logs.repository;

import com.sqrc.module.backendsqrc.logs.model.AuditLog;
import com.sqrc.module.backendsqrc.logs.model.LogCategory;
import com.sqrc.module.backendsqrc.logs.model.LogLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestionar los logs de auditoría.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Busca logs por categoría
     */
    List<AuditLog> findByCategoryOrderByTimestampDesc(LogCategory category);

    /**
     * Busca logs por nivel
     */
    List<AuditLog> findByLevelOrderByTimestampDesc(LogLevel level);

    /**
     * Busca logs por usuario
     */
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Busca logs por entidad
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    /**
     * Busca logs en un rango de fechas
     */
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    /**
     * Busca logs por categoría y rango de fechas
     */
    @Query("SELECT a FROM AuditLog a WHERE a.category = :category " +
           "AND a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<AuditLog> findByCategoryAndDateRange(
            @Param("category") LogCategory category,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Cuenta logs por categoría en un período
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.category = :category " +
           "AND a.timestamp >= :since")
    Long countByCategorySince(
            @Param("category") LogCategory category,
            @Param("since") LocalDateTime since);

    /**
     * Busca logs por nivel con paginación
     */
    Page<AuditLog> findByLevelOrderByTimestampDesc(LogLevel level, Pageable pageable);

    /**
     * Busca logs por categoría con paginación
     */
    Page<AuditLog> findByCategoryOrderByTimestampDesc(LogCategory category, Pageable pageable);

    /**
     * Busca logs por nivel y categoría con paginación
     */
    Page<AuditLog> findByLevelAndCategoryOrderByTimestampDesc(LogLevel level, LogCategory category, Pageable pageable);

    /**
     * Busca todos ordenados por timestamp descendente con paginación
     */
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
