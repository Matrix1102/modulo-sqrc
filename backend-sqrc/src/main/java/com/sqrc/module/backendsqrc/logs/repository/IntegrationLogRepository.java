package com.sqrc.module.backendsqrc.logs.repository;

import com.sqrc.module.backendsqrc.logs.model.IntegrationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestionar los logs de integración con servicios externos.
 */
@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {

    /**
     * Busca logs por servicio
     */
    List<IntegrationLog> findByServiceNameOrderByTimestampDesc(String serviceName);

    /**
     * Busca logs por operación
     */
    List<IntegrationLog> findByOperationOrderByTimestampDesc(String operation);

    /**
     * Busca logs fallidos
     */
    List<IntegrationLog> findBySuccessFalseOrderByTimestampDesc();

    /**
     * Busca logs exitosos de un servicio
     */
    List<IntegrationLog> findByServiceNameAndSuccessTrueOrderByTimestampDesc(String serviceName);

    /**
     * Busca por correlation ID
     */
    List<IntegrationLog> findByCorrelationIdOrderByTimestampDesc(String correlationId);

    /**
     * Busca logs en un rango de fechas
     */
    Page<IntegrationLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    /**
     * Calcula tiempo promedio de respuesta por servicio
     */
    @Query("SELECT i.serviceName, AVG(i.durationMs) FROM IntegrationLog i " +
           "WHERE i.timestamp >= :since AND i.success = true " +
           "GROUP BY i.serviceName")
    List<Object[]> avgDurationByServiceSince(@Param("since") LocalDateTime since);

    /**
     * Cuenta llamadas por servicio y estado
     */
    @Query("SELECT i.serviceName, i.success, COUNT(i) FROM IntegrationLog i " +
           "WHERE i.timestamp >= :since GROUP BY i.serviceName, i.success")
    List<Object[]> countByServiceAndStatusSince(@Param("since") LocalDateTime since);
}
