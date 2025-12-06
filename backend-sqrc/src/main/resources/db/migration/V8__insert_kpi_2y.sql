SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- KPI DATA: Dispersed realistic rows for 2 years
-- Range: 2023-12-07 .. 2025-12-06 (monthly snapshots + recent days)
-- Inserts for: kpi_dashboard_encuestas, kpi_resumen_diario,
--              kpi_rendimiento_agente_diario, kpi_tiempos_resolucion,
--              kpi_motivos_frecuentes
-- ==========================================

-- 1) Monthly snapshots for dashboard CSAT (one row per month on the 6th)
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES
('2024-01-06', 3.60, 3.50, 24, 0.12),
('2024-02-06', 3.40, 3.35, 18, 0.10),
('2024-03-06', 3.50, 3.45, 22, 0.11),
('2024-04-06', 3.70, 3.65, 30, 0.15),
('2024-05-06', 3.80, 3.75, 28, 0.14),
('2024-06-06', 3.90, 3.85, 35, 0.16),
('2024-07-06', 4.00, 3.95, 40, 0.18),
('2024-08-06', 4.10, 4.05, 45, 0.19),
('2024-09-06', 3.95, 3.90, 32, 0.14),
('2024-10-06', 3.85, 3.80, 29, 0.13),
('2024-11-06', 4.05, 4.00, 50, 0.20),
('2024-12-06', 4.15, 4.10, 55, 0.21),
('2025-01-06', 4.20, 4.15, 58, 0.22),
('2025-02-06', 4.25, 4.20, 60, 0.22),
('2025-03-06', 4.30, 4.25, 62, 0.23),
('2025-04-06', 4.35, 4.30, 65, 0.24),
('2025-05-06', 4.40, 4.35, 68, 0.25),
('2025-06-06', 4.45, 4.40, 70, 0.26),
('2025-07-06', 4.50, 4.45, 75, 0.27),
('2025-08-06', 4.55, 4.50, 78, 0.28),
('2025-09-06', 4.50, 4.45, 72, 0.26),
('2025-10-06', 4.45, 4.40, 66, 0.24),
('2025-11-06', 4.60, 4.55, 82, 0.29),
('2025-12-06', 4.65, 4.60, 95, 0.32);

-- 2) A few recent daily rows (December 2025) to reflect short-term fluctuation
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES
('2025-12-01', 90.0, 89.0, 20, 0.30),
('2025-12-02', 91.0, 90.0, 22, 0.31),
('2025-12-06', 93.0, 92.0, 33, 0.33);

-- 3) Daily resumo: kpi_resumen_diario (mix of tipos y canales over a selection of dates)
-- Using TipoCaso values: RECLAMO, SOLICITUD, QUEJA, CONSULTA
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES
('2024-06-06', 'RECLAMO', 'LLAMADA', 12, 9),
('2024-06-06', 'SOLICITUD', 'PRESENCIAL', 8, 7),
('2024-09-06', 'RECLAMO', 'LLAMADA', 10, 6),
('2024-11-06', 'CONSULTA', 'LLAMADA', 14, 14),
('2025-03-06', 'QUEJA', 'PRESENCIAL', 6, 4),
('2025-06-06', 'RECLAMO', 'LLAMADA', 18, 15),
('2025-06-06', 'SOLICITUD', 'PRESENCIAL', 11, 10),
('2025-09-06', 'CONSULTA', 'LLAMADA', 20, 18),
('2025-11-06', 'RECLAMO', 'PRESENCIAL', 9, 6),
('2025-12-06', 'RECLAMO', 'LLAMADA', 22, 20),
('2025-12-06', 'CONSULTA', 'LLAMADA', 12, 12);

-- 4) Agent daily performance snapshots (kpi_rendimiento_agente_diario)
-- Agents in seeds: 6..10
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES
('2024-12-06', 6, 8, 45, 3.95),
('2024-12-06', 7, 6, 60, 3.75),
('2024-12-06', 8, 10, 38, 4.10),
('2024-12-06', 9, 7, 55, 3.80),
('2024-12-06', 10, 5, 70, 3.65),

('2025-06-06', 6, 12, 40, 4.25),
('2025-06-06', 7, 9, 52, 4.10),
('2025-06-06', 8, 15, 35, 4.40),
('2025-06-06', 9, 10, 48, 4.05),
('2025-06-06', 10, 8, 60, 3.95),

('2025-12-06', 6, 14, 37, 4.50),
('2025-12-06', 7, 11, 44, 4.40),
('2025-12-06', 8, 18, 33, 4.60),
('2025-12-06', 9, 12, 45, 4.35),
('2025-12-06', 10, 9, 52, 4.25);

-- 5) Resolution time KPIs (kpi_tiempos_resolucion) - sampled dates
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES
('2024-06-06', 'RECLAMO', 'LLAMADA', 15, 180),
('2024-12-06', 'SOLICITUD', 'PRESENCIAL', 30, 240),
('2025-06-06', 'CONSULTA', 'LLAMADA', 10, 60),
('2025-06-06', 'RECLAMO', 'LLAMADA', 12, 150),
('2025-12-06', 'RECLAMO', 'LLAMADA', 8, 120),
('2025-12-06', 'CONSULTA', 'LLAMADA', 6, 45);

-- 6) Frequent motives (kpi_motivos_frecuentes) - snapshot on some months
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES
('2024-06-06', 1, 5),
('2024-06-06', 2, 8),
('2024-12-06', 1, 12),
('2024-12-06', 3, 9),
('2025-06-06', 2, 15),
('2025-06-06', 6, 7),
('2025-12-06', 1, 20),
('2025-12-06', 7, 11),
('2025-12-06', 9, 9);

-- ==================================================
-- Additional explicit inserts (registro por registro)
-- Target: ~150 rows total across KPI tables (added below)
-- ==================================================

-- A) Additional daily dashboard rows (40 single-row inserts)
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-01', 4.20, 4.15, 60, 0.20);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-05', 4.10, 4.05, 55, 0.18);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-10', 4.25, 4.20, 62, 0.21);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-15', 4.15, 4.10, 58, 0.19);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-20', 4.30, 4.25, 65, 0.22);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-25', 4.35, 4.30, 68, 0.23);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-01-30', 4.25, 4.20, 63, 0.21);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-02', 4.30, 4.25, 66, 0.22);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-07', 4.35, 4.30, 70, 0.24);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-12', 4.40, 4.35, 72, 0.24);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-17', 4.20, 4.15, 61, 0.20);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-22', 4.25, 4.20, 64, 0.21);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-02-27', 4.45, 4.40, 75, 0.25);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-03', 4.50, 4.45, 78, 0.26);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-08', 4.40, 4.35, 71, 0.23);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-13', 4.35, 4.30, 69, 0.22);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-18', 4.30, 4.25, 68, 0.22);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-23', 4.25, 4.20, 66, 0.21);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-03-28', 4.35, 4.30, 70, 0.23);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-02', 4.40, 4.35, 73, 0.24);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-07', 4.45, 4.40, 76, 0.25);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-12', 4.50, 4.45, 80, 0.27);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-17', 4.55, 4.50, 82, 0.28);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-22', 4.45, 4.40, 78, 0.26);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-04-27', 4.40, 4.35, 75, 0.25);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-02', 4.50, 4.45, 85, 0.29);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-07', 4.55, 4.50, 88, 0.30);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-12', 4.60, 4.55, 90, 0.31);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-17', 4.50, 4.45, 82, 0.28);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-22', 4.45, 4.40, 80, 0.27);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, csat_promedio_agente_global, total_respuestas_global, tasa_respuesta_global) VALUES ('2025-05-27', 4.55, 4.50, 87, 0.30);

-- B) Agent performance: 8 dates × 5 agents = 40 single-row inserts
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-01', 6, 10, 38, 86.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-01', 7, 8, 45, 82.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-01', 8, 12, 35, 88.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-01', 9, 9, 42, 84.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-01', 10, 7, 50, 80.0);

INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-10', 6, 11, 36, 87.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-10', 7, 9, 44, 83.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-10', 8, 15, 34, 90.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-10', 9, 10, 40, 85.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-10', 10, 8, 48, 81.0);

INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-20', 6, 9, 39, 84.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-20', 7, 7, 50, 79.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-20', 8, 13, 33, 89.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-20', 9, 11, 41, 86.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-02-20', 10, 6, 55, 78.0);

INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-01', 6, 12, 34, 88.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-01', 7, 10, 42, 85.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-01', 8, 16, 30, 92.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-01', 9, 12, 38, 87.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-01', 10, 9, 47, 83.0);

INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-10', 6, 13, 33, 89.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-10', 7, 11, 40, 86.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-10', 8, 17, 29, 93.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-10', 9, 13, 36, 88.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-10', 10, 10, 45, 85.0);

INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-20', 6, 14, 31, 90.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-20', 7, 12, 39, 87.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-20', 8, 18, 28, 94.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-20', 9, 14, 35, 89.0);
INSERT INTO kpi_rendimiento_agente_diario (fecha, agente_id, tickets_resueltos_total, tiempo_prom_res_total_min, csat_promedio_agente) VALUES ('2025-03-20', 10, 11, 43, 86.0);

-- C) kpi_resumen_diario: 20 record-by-record inserts across varied dates / canales / tipos
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-01-05', 'RECLAMO', 'LLAMADA', 14, 11);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-01-05', 'SOLICITUD', 'PRESENCIAL', 6, 5);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-01-10', 'CONSULTA', 'LLAMADA', 10, 10);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-01-15', 'QUEJA', 'PRESENCIAL', 4, 2);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-02-01', 'RECLAMO', 'LLAMADA', 16, 13);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-02-10', 'SOLICITUD', 'PRESENCIAL', 7, 6);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-02-20', 'CONSULTA', 'LLAMADA', 12, 11);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-01', 'RECLAMO', 'PRESENCIAL', 9, 7);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-05', 'QUEJA', 'LLAMADA', 5, 4);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-10', 'CONSULTA', 'LLAMADA', 18, 17);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-15', 'SOLICITUD', 'PRESENCIAL', 8, 8);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-20', 'RECLAMO', 'LLAMADA', 20, 17);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-03-25', 'CONSULTA', 'LLAMADA', 14, 14);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-01', 'RECLAMO', 'PRESENCIAL', 11, 9);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-05', 'QUEJA', 'PRESENCIAL', 6, 4);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-10', 'SOLICITUD', 'LLAMADA', 9, 8);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-15', 'CONSULTA', 'LLAMADA', 15, 14);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-20', 'RECLAMO', 'LLAMADA', 13, 10);
INSERT INTO kpi_resumen_diario (fecha, tipo_caso, canal, total_casos_creados, total_casos_resueltos) VALUES ('2025-04-25', 'SOLICITUD', 'PRESENCIAL', 7, 7);

-- D) Resolution times: 10 explicit inserts
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-01-10', 'RECLAMO', 'LLAMADA', 12, 150);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-01-20', 'SOLICITUD', 'PRESENCIAL', 25, 210);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-02-01', 'CONSULTA', 'LLAMADA', 8, 45);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-02-10', 'RECLAMO', 'LLAMADA', 10, 130);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-02-20', 'SOLICITUD', 'PRESENCIAL', 20, 200);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-03-01', 'CONSULTA', 'LLAMADA', 6, 40);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-03-10', 'RECLAMO', 'LLAMADA', 9, 120);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-03-20', 'SOLICITUD', 'PRESENCIAL', 22, 230);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-04-01', 'CONSULTA', 'LLAMADA', 5, 35);
INSERT INTO kpi_tiempos_resolucion (fecha, tipo_caso, canal, tiempo_prom_prim_respuesta, tiempo_prom_res_total_min) VALUES ('2025-04-10', 'RECLAMO', 'LLAMADA', 11, 140);

-- E) Motives: 10 additional single-row inserts (monthly-ish)
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-01-01', 1, 8);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-01-01', 2, 6);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-02-01', 3, 9);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-02-01', 6, 5);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-03-01', 1, 12);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-03-01', 7, 7);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-04-01', 2, 10);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-04-01', 3, 6);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-05-01', 1, 15);
INSERT INTO kpi_motivos_frecuentes (fecha, id_motivo, conteo_total) VALUES ('2025-05-01', 9, 8);

SET FOREIGN_KEY_CHECKS = 1;
