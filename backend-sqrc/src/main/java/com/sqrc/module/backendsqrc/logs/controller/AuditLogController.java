package com.sqrc.module.backendsqrc.logs.controller;

import com.sqrc.module.backendsqrc.logs.model.AuditLog;
import com.sqrc.module.backendsqrc.logs.model.ErrorLog;
import com.sqrc.module.backendsqrc.logs.model.LogCategory;
import com.sqrc.module.backendsqrc.logs.model.LogLevel;
import com.sqrc.module.backendsqrc.logs.repository.AuditLogRepository;
import com.sqrc.module.backendsqrc.logs.repository.ErrorLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller para exponer los logs de auditoría y errores al frontend.
 */
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final ErrorLogRepository errorLogRepository;

    /**
     * Obtiene todos los logs con paginación y filtros opcionales.
     * 
     * @param page Número de página (0-based)
     * @param size Tamaño de página
     * @param level Filtro por nivel (INFO, WARN, ERROR, DEBUG)
     * @param category Filtro por categoría
     * @param userId Filtro por usuario
     * @param startDate Fecha inicio del rango
     * @param endDate Fecha fin del rango
     * @param search Búsqueda en action
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search
    ) {
        log.info("GET /api/logs - page={}, size={}, level={}, category={}", page, size, level, category);

        PageRequest pageRequest = PageRequest.of(page, size);
        
        Page<AuditLog> logsPage;
        
        // Convertir strings a enums si están presentes
        LogLevel levelEnum = null;
        LogCategory categoryEnum = null;
        
        if (level != null && !level.isEmpty()) {
            try {
                levelEnum = LogLevel.valueOf(level.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Nivel de log inválido: {}", level);
            }
        }
        
        if (category != null && !category.isEmpty()) {
            try {
                categoryEnum = LogCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Categoría de log inválida: {}", category);
            }
        }
        
        // Usar queries específicos según los filtros
        if (levelEnum != null && categoryEnum != null) {
            logsPage = auditLogRepository.findByLevelAndCategoryOrderByTimestampDesc(levelEnum, categoryEnum, pageRequest);
        } else if (levelEnum != null) {
            logsPage = auditLogRepository.findByLevelOrderByTimestampDesc(levelEnum, pageRequest);
        } else if (categoryEnum != null) {
            logsPage = auditLogRepository.findByCategoryOrderByTimestampDesc(categoryEnum, pageRequest);
        } else {
            logsPage = auditLogRepository.findAllByOrderByTimestampDesc(pageRequest);
        }

        // Filtrar por búsqueda de texto (esto sí se hace en memoria, pero sobre los resultados ya filtrados)
        List<AuditLog> filteredLogs = logsPage.getContent();
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            filteredLogs = filteredLogs.stream()
                    .filter(l -> 
                            (l.getAction() != null && l.getAction().toLowerCase().contains(searchLower)) ||
                            (l.getEntityType() != null && l.getEntityType().toLowerCase().contains(searchLower)) ||
                            (l.getRequestUri() != null && l.getRequestUri().toLowerCase().contains(searchLower)))
                    .toList();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", filteredLogs);
        response.put("totalElements", logsPage.getTotalElements());
        response.put("totalPages", logsPage.getTotalPages());
        response.put("currentPage", page);
        response.put("pageSize", size);

        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene un log específico por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getLogById(@PathVariable Long id) {
        log.info("GET /api/logs/{}", id);
        return auditLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene los niveles de log disponibles.
     */
    @GetMapping("/levels")
    public ResponseEntity<LogLevel[]> getLevels() {
        return ResponseEntity.ok(LogLevel.values());
    }

    /**
     * Obtiene las categorías de log disponibles.
     */
    @GetMapping("/categories")
    public ResponseEntity<LogCategory[]> getCategories() {
        return ResponseEntity.ok(LogCategory.values());
    }

    /**
     * Obtiene los logs más recientes (últimos 100).
     */
    @GetMapping("/recent")
    public ResponseEntity<List<AuditLog>> getRecentLogs() {
        log.info("GET /api/logs/recent");
        PageRequest pageRequest = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(auditLogRepository.findAll(pageRequest).getContent());
    }

    /**
     * Obtiene estadísticas de logs.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.info("GET /api/logs/stats");
        
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        LocalDateTime last7d = LocalDateTime.now().minusDays(7);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", auditLogRepository.count());
        
        // Contar por nivel en las últimas 24h
        Map<String, Long> byLevel = new HashMap<>();
        for (LogLevel level : LogLevel.values()) {
            long count = auditLogRepository.findByLevelOrderByTimestampDesc(level).stream()
                    .filter(l -> l.getTimestamp().isAfter(last24h))
                    .count();
            byLevel.put(level.name(), count);
        }
        stats.put("byLevelLast24h", byLevel);
        
        // Contar por categoría en las últimas 24h
        Map<String, Long> byCategory = new HashMap<>();
        for (LogCategory category : LogCategory.values()) {
            long count = auditLogRepository.countByCategorySince(category, last24h);
            byCategory.put(category.name(), count);
        }
        stats.put("byCategoryLast24h", byCategory);
        
        return ResponseEntity.ok(stats);
    }

    // ==================== ERROR LOGS ====================

    /**
     * Obtiene los logs de errores con paginación.
     */
    @GetMapping("/errors")
    public ResponseEntity<Map<String, Object>> getErrorLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String exceptionType,
            @RequestParam(required = false) String search
    ) {
        log.info("GET /api/logs/errors - page={}, size={}, exceptionType={}", page, size, exceptionType);

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        
        Page<ErrorLog> errorsPage = errorLogRepository.findMostRecent(pageRequest);

        // Filtrar por tipo de excepción o búsqueda si se especifica
        List<ErrorLog> filteredErrors = errorsPage.getContent();
        if (exceptionType != null && !exceptionType.isEmpty()) {
            filteredErrors = filteredErrors.stream()
                    .filter(e -> e.getExceptionType() != null && 
                            e.getExceptionType().toLowerCase().contains(exceptionType.toLowerCase()))
                    .toList();
        }
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            filteredErrors = filteredErrors.stream()
                    .filter(e -> 
                            (e.getMessage() != null && e.getMessage().toLowerCase().contains(searchLower)) ||
                            (e.getRequestUri() != null && e.getRequestUri().toLowerCase().contains(searchLower)) ||
                            (e.getExceptionType() != null && e.getExceptionType().toLowerCase().contains(searchLower)))
                    .toList();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", filteredErrors);
        response.put("totalElements", errorsPage.getTotalElements());
        response.put("totalPages", errorsPage.getTotalPages());
        response.put("currentPage", page);
        response.put("pageSize", size);

        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene un error específico por ID (incluye stack trace).
     */
    @GetMapping("/errors/{id}")
    public ResponseEntity<ErrorLog> getErrorById(@PathVariable Long id) {
        log.info("GET /api/logs/errors/{}", id);
        return errorLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene estadísticas de errores.
     */
    @GetMapping("/errors/stats")
    public ResponseEntity<Map<String, Object>> getErrorStats() {
        log.info("GET /api/logs/errors/stats");
        
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", errorLogRepository.count());
        stats.put("byExceptionTypeLast24h", errorLogRepository.countByExceptionTypeSince(last24h));
        
        return ResponseEntity.ok(stats);
    }
}
