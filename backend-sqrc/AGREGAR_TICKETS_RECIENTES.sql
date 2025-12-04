-- =====================================================
-- EJECUTAR EN MySQL Workbench para agregar tickets recientes
-- Esto permite que la lista de "Tickets con interacción reciente" muestre datos
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;



-- ==========================================
-- TICKETS RECIENTES (Noviembre-Diciembre 2025)
-- ==========================================

-- Tickets de la semana anterior (27 Nov - 30 Nov)
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES
(200, 'Consulta de Saldo', 8, 'Necesito saber mi saldo actual', 'CERRADO', '2025-11-27 09:30:00', '2025-11-27 09:45:00', 'LLAMADA', 1, 'CONSULTA', NULL),
(201, 'Cobro Duplicado Noviembre', 1, 'Me cobraron dos veces este mes', 'CERRADO', '2025-11-27 10:15:00', '2025-11-28 14:00:00', 'LLAMADA', 2, 'RECLAMO', NULL),
(202, 'Cambio de Plan', 5, 'Quiero aumentar mis gigas', 'CERRADO', '2025-11-27 11:00:00', '2025-11-27 11:30:00', 'PRESENCIAL', 3, 'SOLICITUD', 7001),
(203, 'Internet Lento', 2, 'La velocidad no es la contratada', 'CERRADO', '2025-11-28 09:00:00', '2025-11-29 16:00:00', 'LLAMADA', 4, 'RECLAMO', NULL),
(204, 'Consulta Promociones', 10, 'Información sobre Black Friday', 'CERRADO', '2025-11-28 10:30:00', '2025-11-28 10:45:00', 'LLAMADA', 5, 'CONSULTA', NULL),
(205, 'Activar Roaming', 9, 'Viajo a Europa mañana', 'CERRADO', '2025-11-28 14:00:00', '2025-11-28 14:20:00', 'PRESENCIAL', 1, 'SOLICITUD', 7002),
(206, 'Falla de Señal', 3, 'Sin cobertura en mi zona', 'CERRADO', '2025-11-29 08:45:00', '2025-11-30 11:00:00', 'LLAMADA', 2, 'RECLAMO', NULL),
(207, 'Queja por Atención', 7, 'El agente fue descortés', 'CERRADO', '2025-11-29 15:30:00', '2025-11-30 10:00:00', 'LLAMADA', 3, 'QUEJA', NULL),
(208, 'Baja de Servicio TV', 4, 'Cancelar paquete deportes', 'CERRADO', '2025-11-30 09:00:00', '2025-11-30 09:30:00', 'PRESENCIAL', 4, 'SOLICITUD', 7003),
(209, 'Equipo Defectuoso', 6, 'El celular se apaga solo', 'ESCALADO', '2025-11-30 11:00:00', NULL, 'PRESENCIAL', 5, 'RECLAMO', NULL),

-- Tickets de esta semana (1 Dic - 4 Dic)
(210, 'Consulta Facturación', 8, 'Detalle de mi última factura', 'CERRADO', '2025-12-01 08:30:00', '2025-12-01 08:50:00', 'LLAMADA', 1, 'CONSULTA', NULL),
(211, 'Problema con App', 2, 'La app no carga correctamente', 'CERRADO', '2025-12-01 10:00:00', '2025-12-01 15:00:00', 'LLAMADA', 2, 'RECLAMO', NULL),
(212, 'Cambio de Titularidad', 5, 'Transferir línea a familiar', 'DERIVADO', '2025-12-01 11:30:00', NULL, 'PRESENCIAL', 3, 'SOLICITUD', 7004),
(213, 'Cobro por Servicio no Solicitado', 1, 'Me cobran un extra desconocido', 'ABIERTO', '2025-12-01 14:00:00', NULL, 'LLAMADA', 4, 'RECLAMO', NULL),
(214, 'Consulta Cobertura 5G', 9, 'Zonas con cobertura 5G', 'CERRADO', '2025-12-02 09:15:00', '2025-12-02 09:30:00', 'LLAMADA', 5, 'CONSULTA', NULL),
(215, 'Internet Intermitente', 3, 'Se corta la conexión frecuentemente', 'CERRADO', '2025-12-02 10:45:00', '2025-12-03 09:00:00', 'LLAMADA', 1, 'RECLAMO', NULL),
(216, 'Reposición de Chip', 6, 'Perdí mi chip, necesito uno nuevo', 'CERRADO', '2025-12-02 15:00:00', '2025-12-02 15:20:00', 'PRESENCIAL', 2, 'SOLICITUD', 7005),
(217, 'Promoción no Aplicada', 10, 'El descuento no apareció', 'ABIERTO', '2025-12-03 08:30:00', NULL, 'LLAMADA', 3, 'RECLAMO', NULL),
(218, 'Queja por Demora', 7, 'Esperé 40 minutos para atención', 'CERRADO', '2025-12-03 11:00:00', '2025-12-03 14:00:00', 'PRESENCIAL', 4, 'QUEJA', NULL),
(219, 'Consulta Estado de Reclamo', 8, 'Seguimiento de reclamo anterior', 'CERRADO', '2025-12-03 16:00:00', '2025-12-03 16:15:00', 'LLAMADA', 5, 'CONSULTA', NULL),

-- Tickets de HOY (4 Dic 2025)
(220, 'Factura Incorrecta', 1, 'El monto no coincide con mi plan', 'ABIERTO', '2025-12-04 08:00:00', NULL, 'LLAMADA', 1, 'RECLAMO', NULL),
(221, 'Consulta Saldo Prepago', 8, 'Verificar saldo disponible', 'CERRADO', '2025-12-04 08:30:00', '2025-12-04 08:40:00', 'LLAMADA', 2, 'CONSULTA', NULL),
(222, 'Cambio de Plan Familiar', 5, 'Agregar línea adicional', 'ABIERTO', '2025-12-04 09:15:00', NULL, 'PRESENCIAL', 3, 'SOLICITUD', NULL),
(223, 'Velocidad Reducida', 2, 'Internet muy lento desde ayer', 'ABIERTO', '2025-12-04 10:00:00', NULL, 'LLAMADA', 4, 'RECLAMO', NULL),
(224, 'Consulta Portabilidad', 9, 'Proceso para cambiar de operador', 'CERRADO', '2025-12-04 10:30:00', '2025-12-04 10:50:00', 'LLAMADA', 5, 'CONSULTA', NULL),
(225, 'Equipo en Garantía', 6, 'Solicitar revisión técnica', 'ABIERTO', '2025-12-04 11:00:00', NULL, 'PRESENCIAL', 1, 'RECLAMO', NULL);

-- ==========================================
-- ASIGNACIONES PARA LOS TICKETS RECIENTES
-- (empleado_id 6-10 son los agentes: Sofia, Carlos, Ana, Luis, Pedro)
-- ==========================================

INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES
-- Semana anterior
(200, 6, NULL, '2025-11-27 09:32:00', '2025-11-27 09:45:00', NULL),
(201, 7, NULL, '2025-11-27 10:20:00', '2025-11-28 14:00:00', NULL),
(202, 9, NULL, '2025-11-27 11:05:00', '2025-11-27 11:30:00', NULL),
(203, 8, NULL, '2025-11-28 09:05:00', '2025-11-29 16:00:00', NULL),
(204, 6, NULL, '2025-11-28 10:32:00', '2025-11-28 10:45:00', NULL),
(205, 10, NULL, '2025-11-28 14:05:00', '2025-11-28 14:20:00', NULL),
(206, 7, NULL, '2025-11-29 08:50:00', '2025-11-30 11:00:00', NULL),
(207, 8, NULL, '2025-11-29 15:35:00', '2025-11-30 10:00:00', NULL),
(208, 9, NULL, '2025-11-30 09:05:00', '2025-11-30 09:30:00', NULL),
(209, 10, NULL, '2025-11-30 11:05:00', NULL, NULL),

-- Esta semana
(210, 6, NULL, '2025-12-01 08:32:00', '2025-12-01 08:50:00', NULL),
(211, 7, NULL, '2025-12-01 10:05:00', '2025-12-01 15:00:00', NULL),
(212, 9, NULL, '2025-12-01 11:35:00', NULL, NULL),
(213, 8, NULL, '2025-12-01 14:05:00', NULL, NULL),
(214, 6, NULL, '2025-12-02 09:17:00', '2025-12-02 09:30:00', NULL),
(215, 7, NULL, '2025-12-02 10:50:00', '2025-12-03 09:00:00', NULL),
(216, 10, NULL, '2025-12-02 15:03:00', '2025-12-02 15:20:00', NULL),
(217, 8, NULL, '2025-12-03 08:35:00', NULL, NULL),
(218, 9, NULL, '2025-12-03 11:05:00', '2025-12-03 14:00:00', NULL),
(219, 6, NULL, '2025-12-03 16:02:00', '2025-12-03 16:15:00', NULL),

-- HOY
(220, 7, NULL, '2025-12-04 08:05:00', NULL, NULL),
(221, 6, NULL, '2025-12-04 08:32:00', '2025-12-04 08:40:00', NULL),
(222, 9, NULL, '2025-12-04 09:20:00', NULL, NULL),
(223, 8, NULL, '2025-12-04 10:05:00', NULL, NULL),
(224, 6, NULL, '2025-12-04 10:32:00', '2025-12-04 10:50:00', NULL),
(225, 10, NULL, '2025-12-04 11:05:00', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- RESUMEN:
-- 26 tickets nuevos con fechas de Nov 27 - Dic 4, 2025
-- Asignados a agentes 6-10 (Sofia, Carlos, Ana, Luis, Pedro)
-- =====================================================
