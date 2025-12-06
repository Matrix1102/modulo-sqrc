package com.sqrc.module.backendsqrc.logs.repository;

import com.sqrc.module.backendsqrc.logs.model.ErrorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestionar los logs de errores.
 */
@Repository
public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {

    /**
     * Busca errores por tipo de excepción
     */
    List<ErrorLog> findByExceptionTypeOrderByTimestampDesc(String exceptionType);

    /**
     * Busca errores por usuario
     */
    List<ErrorLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Busca errores en un rango de fechas
     */
    Page<ErrorLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    /**
     * Busca errores por URI
     */
    List<ErrorLog> findByRequestUriContainingOrderByTimestampDesc(String uriPattern);

    /**
     * Busca por correlation ID
     */
    List<ErrorLog> findByCorrelationIdOrderByTimestampDesc(String correlationId);

    /**
     * Cuenta errores por tipo en un período
     */
    @Query("SELECT e.exceptionType, COUNT(e) FROM ErrorLog e " +
           "WHERE e.timestamp >= :since GROUP BY e.exceptionType ORDER BY COUNT(e) DESC")
    List<Object[]> countByExceptionTypeSince(@Param("since") LocalDateTime since);

    /**
     * Busca los errores más recientes
     */
    @Query("SELECT e FROM ErrorLog e ORDER BY e.timestamp DESC")
    Page<ErrorLog> findMostRecent(Pageable pageable);
}
