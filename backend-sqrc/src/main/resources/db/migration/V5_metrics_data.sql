SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- TICKETS PARA CLIENTE 1 (Juan Perez)
-- ==========================================

-- MES ANTERIOR (Octubre/Noviembre - Para tendencias)
-- Ticket Cerrado (Rápido)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (101, 'Consulta Saldo Anterior', 8, 'Consulta de saldo mes pasado', 'CERRADO', '2023-10-15 10:00:00', '2023-10-15 12:00:00', 'LLAMADA', 1, 'CONSULTA', NULL);

-- Ticket Cerrado (Lento)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (102, 'Reclamo Factura Octubre', 1, 'Cobro indebido octubre', 'CERRADO', '2023-10-20 09:00:00', '2023-10-25 15:00:00', 'LLAMADA', 1, 'RECLAMO', NULL);

-- Ticket Cerrado
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (103, 'Solicitud Baja Paquete', 4, 'Baja de paquete deportes', 'CERRADO', '2023-11-01 14:00:00', '2023-11-02 10:00:00', 'PRESENCIAL', 1, 'SOLICITUD', 6001);

-- MES ACTUAL (Noviembre/Diciembre - Para métricas actuales)
-- Ticket Cerrado (Muy Rápido - mejora promedio)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (104, 'Consulta Roaming', 9, 'Activar roaming', 'CERRADO', '2023-11-20 10:00:00', '2023-11-20 10:30:00', 'LLAMADA', 1, 'CONSULTA', NULL);

-- Ticket Cerrado (Normal)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (105, 'Falla de Red', 3, 'Sin señal por 1 hora', 'CERRADO', '2023-11-25 15:00:00', '2023-11-25 18:00:00', 'LLAMADA', 1, 'RECLAMO', NULL);

-- Ticket Abierto 1
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (106, 'Equipo Defectuoso', 6, 'Pantalla parpadea', 'ABIERTO', '2023-12-01 09:00:00', NULL, 'PRESENCIAL', 1, 'RECLAMO', NULL);

-- Ticket Abierto 2 (Escalado)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (107, 'Queja Atención', 7, 'Mala atención en call center', 'ESCALADO', '2023-12-02 11:00:00', NULL, 'LLAMADA', 1, 'QUEJA', NULL);

-- Ticket Abierto 3 (Derivado)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) 
VALUES (108, 'Cambio Titularidad', 5, 'Tramite en proceso', 'DERIVADO', '2023-12-03 10:00:00', NULL, 'PRESENCIAL', 1, 'SOLICITUD', 6002);

-- ==========================================
-- ASIGNACIONES PARA TICKETS CLIENTE 1
-- ==========================================
-- Ticket 101
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (101, 6, NULL, '2023-10-15 10:05:00', '2023-10-15 12:00:00', NULL);

-- Ticket 102
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (102, 7, NULL, '2023-10-20 09:05:00', '2023-10-20 09:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (102, 3, NULL, '2023-10-20 09:30:00', '2023-10-25 15:00:00', LAST_INSERT_ID());

-- Ticket 104
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (104, 8, NULL, '2023-11-20 10:05:00', '2023-11-20 10:30:00', NULL);

-- Ticket 106
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (106, 9, NULL, '2023-12-01 09:10:00', NULL, NULL);

-- Ticket 107
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (107, 6, NULL, '2023-12-02 11:05:00', '2023-12-02 11:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) 
VALUES (107, 1, NULL, '2023-12-02 11:20:00', NULL, LAST_INSERT_ID());

-- ==========================================
-- KPI DASHBOARD ENCUESTAS (Para Calificación de Atención)
-- ==========================================
-- Insertamos datos diarios para que el promedio de los últimos 30 días sea alto (ej. 90/100 -> 4.5/5)
-- Mes Anterior (Para tendencia) - Promedio ~70 (3.5/5)
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-10-15', 70.0, 10);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-10-20', 75.0, 15);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-10-25', 65.0, 12);

-- Mes Actual (Para valor principal) - Promedio ~90 (4.5/5)
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-11-15', 90.0, 20);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-11-20', 95.0, 25);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-11-25', 85.0, 18);
INSERT INTO kpi_dashboard_encuestas (fecha, csat_promedio_servicio_global, total_respuestas_global) VALUES ('2023-12-01', 92.0, 22);

SET FOREIGN_KEY_CHECKS = 1;
