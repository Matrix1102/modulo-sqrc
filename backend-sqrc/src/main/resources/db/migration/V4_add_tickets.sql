SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- CLIENTES (10 registros)
-- ==========================================
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (1, '10000001', 'Juan', 'Perez', '1985-01-15', 'juan.perez@mail.com', '555-1001', '999000001', '2023-01-10', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (2, '10000002', 'Maria', 'Gomez', '1990-05-20', 'maria.gomez@mail.com', '555-1002', '999000002', '2023-02-15', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (3, '10000003', 'Carlos', 'Ruiz', '1982-08-10', 'carlos.ruiz@mail.com', '555-1003', '999000003', '2023-03-01', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (4, '10000004', 'Ana', 'Torres', '1995-11-30', 'ana.torres@mail.com', '555-1004', '999000004', '2023-03-20', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (5, '10000005', 'Luis', 'Fernandez', '1978-04-05', 'luis.fernandez@mail.com', '555-1005', '999000005', '2023-04-10', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (6, '10000006', 'Elena', 'Rodriguez', '1988-09-25', 'elena.rodriguez@mail.com', '555-1006', '999000006', '2023-05-05', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (7, '10000007', 'Miguel', 'Soto', '1992-12-12', 'miguel.soto@mail.com', '555-1007', '999000007', '2023-06-15', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (8, '10000008', 'Sofia', 'Vargas', '1999-02-28', 'sofia.vargas@mail.com', '555-1008', '999000008', '2023-07-01', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (9, '10000009', 'David', 'Lima', '1980-06-18', 'david.lima@mail.com', '555-1009', '999000009', '2023-08-20', 1);
INSERT INTO clientes (id_cliente, dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES (10, '10000010', 'Carmen', 'Rios', '1994-10-10', 'carmen.rios@mail.com', '555-1010', '999000010', '2023-09-10', 1);

-- ==========================================
-- EMPLEADOS (10 registros)
-- ==========================================
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (1, 'Roberto', 'Manager', '20000001', 'roberto.manager@sqrc.com', '988000001', '1975-01-01', 'Operaciones', 'SUPERVISOR');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (2, 'Patricia', 'Lider', '20000002', 'patricia.lider@sqrc.com', '988000002', '1980-05-05', 'Tecnologia', 'SUPERVISOR');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (3, 'Jorge', 'Resolver', '20000003', 'jorge.resolver@sqrc.com', '988000003', '1985-03-15', 'BackOffice', 'BACKOFFICE');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (4, 'Lucia', 'Analista', '20000004', 'lucia.analista@sqrc.com', '988000004', '1990-07-20', 'BackOffice', 'BACKOFFICE');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (5, 'Mario', 'Experto', '20000005', 'mario.experto@sqrc.com', '988000005', '1988-11-11', 'BackOffice', 'BACKOFFICE');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (6, 'Sofia', 'Call', '20000006', 'sofia.call@sqrc.com', '988000006', '1995-02-14', 'Atencion Telefonica', 'AGENTE_LLAMADA');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (7, 'Diego', 'Phone', '20000007', 'diego.phone@sqrc.com', '988000007', '1998-08-08', 'Atencion Telefonica', 'AGENTE_LLAMADA');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (8, 'Valeria', 'Voice', '20000008', 'valeria.voice@sqrc.com', '988000008', '1996-04-30', 'Atencion Telefonica', 'AGENTE_LLAMADA');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (9, 'Fernando', 'Face', '20000009', 'fernando.face@sqrc.com', '988000009', '1993-09-09', 'Atencion Presencial', 'AGENTE_PRESENCIAL');
INSERT INTO empleados (id_empleado, nombre, apellido, dni, correo, numero_celular, fecha_nacimiento, area, tipo_empleado) VALUES (10, 'Camila', 'Desk', '20000010', 'camila.desk@sqrc.com', '988000010', '1997-12-25', 'Atencion Presencial', 'AGENTE_PRESENCIAL');

-- Detalles Supervisores
INSERT INTO supervisores (id_empleado, nivel_autorizacion, departamento, puede_aprobar_escalamientos) VALUES (1, 5, 'Operaciones', 1);
INSERT INTO supervisores (id_empleado, nivel_autorizacion, departamento, puede_aprobar_escalamientos) VALUES (2, 4, 'Soporte Tecnico', 1);

-- Detalles BackOffice
INSERT INTO backoffice (id_empleado, max_tickets_simultaneos, puede_derivar) VALUES (3, 15, 1);
INSERT INTO backoffice (id_empleado, max_tickets_simultaneos, puede_derivar) VALUES (4, 12, 1);
INSERT INTO backoffice (id_empleado, max_tickets_simultaneos, puede_derivar) VALUES (5, 10, 0);

-- Detalles Agentes (Base)
INSERT INTO agentes (id_empleado, canal_origen, supervisor_id, esta_ocupado) VALUES (6, 'LLAMADA', 1, 0);
INSERT INTO agentes (id_empleado, canal_origen, supervisor_id, esta_ocupado) VALUES (7, 'LLAMADA', 1, 1);
INSERT INTO agentes (id_empleado, canal_origen, supervisor_id, esta_ocupado) VALUES (8, 'LLAMADA', 1, 0);
INSERT INTO agentes (id_empleado, canal_origen, supervisor_id, esta_ocupado) VALUES (9, 'PRESENCIAL', 2, 0);
INSERT INTO agentes (id_empleado, canal_origen, supervisor_id, esta_ocupado) VALUES (10, 'PRESENCIAL', 2, 1);

-- Detalles Agentes Llamada
INSERT INTO agentes_llamada (id_empleado, extension_telefonica, llamadas_atendidas_hoy, tiempo_promedio_llamada, llamadas_activas) VALUES (6, '101', 15, 250, 0);
INSERT INTO agentes_llamada (id_empleado, extension_telefonica, llamadas_atendidas_hoy, tiempo_promedio_llamada, llamadas_activas) VALUES (7, '102', 10, 300, 1);
INSERT INTO agentes_llamada (id_empleado, extension_telefonica, llamadas_atendidas_hoy, tiempo_promedio_llamada, llamadas_activas) VALUES (8, '103', 20, 200, 0);

-- Detalles Agentes Presencial
INSERT INTO agentes_presencial (id_empleado, ventanilla, sede, clientes_atendidos_hoy) VALUES (9, 'V-01', 'Sede Central', 12);
INSERT INTO agentes_presencial (id_empleado, ventanilla, sede, clientes_atendidos_hoy) VALUES (10, 'V-02', 'Sede Norte', 8);

-- ==========================================
-- MOTIVOS (10 registros)
-- ==========================================
INSERT INTO motivos (id_motivo, nombre) VALUES (1, 'Error en Facturacion');
INSERT INTO motivos (id_motivo, nombre) VALUES (2, 'Intermitencia de Internet');
INSERT INTO motivos (id_motivo, nombre) VALUES (3, 'Sin Señal Movil');
INSERT INTO motivos (id_motivo, nombre) VALUES (4, 'Solicitud de Baja');
INSERT INTO motivos (id_motivo, nombre) VALUES (5, 'Cambio de Plan');
INSERT INTO motivos (id_motivo, nombre) VALUES (6, 'Equipo Defectuoso');
INSERT INTO motivos (id_motivo, nombre) VALUES (7, 'Mala Atencion en Tienda');
INSERT INTO motivos (id_motivo, nombre) VALUES (8, 'Consulta de Saldo');
INSERT INTO motivos (id_motivo, nombre) VALUES (9, 'Activacion de Roaming');
INSERT INTO motivos (id_motivo, nombre) VALUES (10, 'Promociones Vigentes');

-- ==========================================
-- TICKETS (30 registros - 3 por cliente)
-- ==========================================
-- Cliente 1
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (1, 'Cobro duplicado', 1, 'Me cobraron dos veces el mes', 'ABIERTO', '2023-10-01 09:00:00', NULL, 'LLAMADA', 1, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (2, 'Internet lento', 2, 'La velocidad no es la contratada', 'CERRADO', '2023-10-02 10:00:00', '2023-10-03 15:00:00', 'LLAMADA', 1, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (3, 'Consulta Roaming', 9, 'Viajo a Europa mañana', 'CERRADO', '2023-10-05 11:00:00', '2023-10-05 11:30:00', 'LLAMADA', 1, 'CONSULTA', NULL);

-- Cliente 2
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (4, 'Baja de linea', 4, 'Quiero dar de baja la linea 2', 'DERIVADO', '2023-10-06 09:00:00', NULL, 'PRESENCIAL', 2, 'SOLICITUD', 5001);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (5, 'Equipo no prende', 6, 'Compre ayer y no funciona', 'ABIERTO', '2023-10-07 14:00:00', NULL, 'PRESENCIAL', 2, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (6, 'Queja atencion', 7, 'El guardia fue grosero', 'CERRADO', '2023-10-08 16:00:00', '2023-10-09 10:00:00', 'PRESENCIAL', 2, 'QUEJA', NULL);

-- Cliente 3
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (7, 'Cambio de plan', 5, 'Quiero mas gigas', 'CERRADO', '2023-10-10 10:00:00', '2023-10-10 10:15:00', 'LLAMADA', 3, 'SOLICITUD', 5002);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (8, 'Sin señal', 3, 'No tengo señal en mi casa', 'ESCALADO', '2023-10-11 11:00:00', NULL, 'LLAMADA', 3, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (9, 'Consulta saldo', 8, 'No me llega el SMS de saldo', 'CERRADO', '2023-10-12 12:00:00', '2023-10-12 12:10:00', 'LLAMADA', 3, 'CONSULTA', NULL);

-- Cliente 4
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (10, 'Factura alta', 1, 'Vino el doble que el mes pasado', 'ABIERTO', '2023-10-13 09:30:00', NULL, 'LLAMADA', 4, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (11, 'Promociones', 10, 'Quiero saber ofertas de iPhone', 'CERRADO', '2023-10-14 15:00:00', '2023-10-14 15:20:00', 'LLAMADA', 4, 'CONSULTA', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (12, 'Router fallando', 2, 'Se reinicia solo', 'DERIVADO', '2023-10-15 18:00:00', NULL, 'LLAMADA', 4, 'RECLAMO', NULL);

-- Cliente 5
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (13, 'Baja servicio TV', 4, 'Ya no veo tele', 'CERRADO', '2023-10-16 10:00:00', '2023-10-17 10:00:00', 'PRESENCIAL', 5, 'SOLICITUD', 5003);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (14, 'Queja espera', 7, 'Espere 2 horas', 'ABIERTO', '2023-10-17 11:00:00', NULL, 'PRESENCIAL', 5, 'QUEJA', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (15, 'Consulta cobertura', 2, 'Llega fibra a mi zona?', 'CERRADO', '2023-10-18 12:00:00', '2023-10-18 12:05:00', 'LLAMADA', 5, 'CONSULTA', NULL);

-- Cliente 6
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (16, 'Chip dañado', 6, 'Mi perro mordio el chip', 'CERRADO', '2023-10-19 14:00:00', '2023-10-19 14:30:00', 'PRESENCIAL', 6, 'SOLICITUD', 5004);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (17, 'Cobro roaming', 1, 'No active roaming y me cobraron', 'ESCALADO', '2023-10-20 15:00:00', NULL, 'LLAMADA', 6, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (18, 'Mala señal 4G', 3, 'En el centro no agarra 4G', 'ABIERTO', '2023-10-21 16:00:00', NULL, 'LLAMADA', 6, 'RECLAMO', NULL);

-- Cliente 7
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (19, 'Cambio titular', 5, 'Poner a nombre de mi esposa', 'DERIVADO', '2023-10-22 09:00:00', NULL, 'PRESENCIAL', 7, 'SOLICITUD', 5005);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (20, 'Consulta equipo', 10, 'Tienen Samsung S23?', 'CERRADO', '2023-10-23 10:00:00', '2023-10-23 10:10:00', 'LLAMADA', 7, 'CONSULTA', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (21, 'Queja tecnico', 7, 'El tecnico ensucio la alfombra', 'ABIERTO', '2023-10-24 11:00:00', NULL, 'LLAMADA', 7, 'QUEJA', NULL);

-- Cliente 8
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (22, 'Internet lento noche', 2, 'Baja velocidad a las 8pm', 'ABIERTO', '2023-10-25 19:00:00', NULL, 'LLAMADA', 8, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (23, 'Factura no llega', 1, 'No recibo factura al mail', 'CERRADO', '2023-10-26 09:00:00', '2023-10-26 09:15:00', 'LLAMADA', 8, 'SOLICITUD', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (24, 'Baja linea adicional', 4, 'Ya no la uso', 'DERIVADO', '2023-10-27 10:00:00', NULL, 'PRESENCIAL', 8, 'SOLICITUD', 5006);

-- Cliente 9
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (25, 'Consulta plan familiar', 10, 'Precios para 4 lineas', 'CERRADO', '2023-10-28 11:00:00', '2023-10-28 11:30:00', 'LLAMADA', 9, 'CONSULTA', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (26, 'Equipo calienta', 6, 'Bateria dura poco', 'ABIERTO', '2023-10-29 12:00:00', NULL, 'PRESENCIAL', 9, 'RECLAMO', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (27, 'Cobro seguro', 1, 'No contrate seguro movil', 'ESCALADO', '2023-10-30 13:00:00', NULL, 'LLAMADA', 9, 'RECLAMO', NULL);

-- Cliente 10
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (28, 'Mala atencion call center', 7, 'Me cortaron la llamada', 'ABIERTO', '2023-10-31 14:00:00', NULL, 'LLAMADA', 10, 'QUEJA', NULL);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (29, 'Cambio domicilio', 5, 'Me mudo el lunes', 'DERIVADO', '2023-11-01 09:00:00', NULL, 'LLAMADA', 10, 'SOLICITUD', 5007);
INSERT INTO tickets (id_ticket, asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket, id_constancia) VALUES (30, 'Sin tono', 2, 'Telefono fijo muerto', 'CERRADO', '2023-11-02 10:00:00', '2023-11-03 10:00:00', 'LLAMADA', 10, 'RECLAMO', NULL);

-- Detalles Tipos de Ticket
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (1, 'Cobro indebido', '2023-10-15', '2023-10-30', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (2, 'Calidad servicio', '2023-10-16', '2023-10-31', 'Solucionado reiniciando puerto');
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (5, 'Garantia equipo', '2023-10-21', '2023-11-05', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (8, 'Cobertura', '2023-10-25', '2023-11-09', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (10, 'Facturacion', '2023-10-27', '2023-11-11', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (12, 'Soporte Tecnico', '2023-10-29', '2023-11-13', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (17, 'Facturacion', '2023-11-03', '2023-11-18', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (18, 'Cobertura', '2023-11-04', '2023-11-19', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (22, 'Soporte Tecnico', '2023-11-08', '2023-11-23', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (26, 'Garantia', '2023-11-12', '2023-11-27', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (27, 'Facturacion', '2023-11-13', '2023-11-28', NULL);
INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES (30, 'Soporte Tecnico', '2023-11-16', '2023-12-01', 'Tecnico visito domicilio');

INSERT INTO consultas (id_ticket, tema) VALUES (3, 'Roaming');
INSERT INTO consultas (id_ticket, tema) VALUES (6, 'Atencion');
INSERT INTO consultas (id_ticket, tema) VALUES (9, 'Saldo');
INSERT INTO consultas (id_ticket, tema) VALUES (11, 'Ventas');
INSERT INTO consultas (id_ticket, tema) VALUES (15, 'Cobertura');
INSERT INTO consultas (id_ticket, tema) VALUES (20, 'Equipos');
INSERT INTO consultas (id_ticket, tema) VALUES (25, 'Planes');

INSERT INTO quejas (id_ticket, impacto, area_involucrada) VALUES (6, 'Medio', 'Seguridad');
INSERT INTO quejas (id_ticket, impacto, area_involucrada) VALUES (14, 'Bajo', 'Atencion Presencial');
INSERT INTO quejas (id_ticket, impacto, area_involucrada) VALUES (21, 'Alto', 'Servicio Tecnico');
INSERT INTO quejas (id_ticket, impacto, area_involucrada) VALUES (28, 'Medio', 'Call Center');

INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (4, 'Baja');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (7, 'Modificacion');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (13, 'Baja');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (16, 'Reposicion');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (19, 'Cambio Titular');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (23, 'Actualizacion Datos');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (24, 'Baja');
INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES (29, 'Traslado');

-- ==========================================
-- ASIGNACIONES (Generando multiples por ticket)
-- ==========================================
-- Ticket 1 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (1, 6, NULL, '2023-10-01 09:05:00', '2023-10-01 09:15:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (1, 3, NULL, '2023-10-01 09:15:00', NULL, 1);

-- Ticket 2 (Cerrado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (2, 7, NULL, '2023-10-02 10:05:00', '2023-10-02 10:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (2, 4, NULL, '2023-10-02 10:20:00', '2023-10-03 14:00:00', 3);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (2, 7, NULL, '2023-10-03 14:00:00', '2023-10-03 15:00:00', 4);

-- Ticket 3 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (3, 8, NULL, '2023-10-05 11:05:00', '2023-10-05 11:30:00', NULL);

-- Ticket 4 (Derivado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (4, 9, NULL, '2023-10-06 09:10:00', '2023-10-06 09:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (4, 3, NULL, '2023-10-06 09:30:00', NULL, 7);

-- Ticket 5 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (5, 10, NULL, '2023-10-07 14:10:00', '2023-10-07 14:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (5, 2, NULL, '2023-10-07 14:30:00', NULL, 9);

-- Ticket 6 (Cerrado, Queja)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (6, 10, NULL, '2023-10-08 16:10:00', '2023-10-08 16:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (6, 1, NULL, '2023-10-08 16:30:00', '2023-10-09 10:00:00', 11);

-- Ticket 7 (Cerrado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (7, 6, NULL, '2023-10-10 10:05:00', '2023-10-10 10:15:00', NULL);

-- Ticket 8 (Escalado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (8, 7, NULL, '2023-10-11 11:05:00', '2023-10-11 11:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (8, 4, NULL, '2023-10-11 11:20:00', '2023-10-12 09:00:00', 14);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (8, 2, NULL, '2023-10-12 09:00:00', NULL, 15);

-- Ticket 9 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (9, 8, NULL, '2023-10-12 12:05:00', '2023-10-12 12:10:00', NULL);

-- Ticket 10 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (10, 3, NULL, '2023-10-13 09:35:00', NULL, NULL);

-- Ticket 11 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (11, 6, NULL, '2023-10-14 15:05:00', '2023-10-14 15:20:00', NULL);

-- Ticket 12 (Derivado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (12, 7, NULL, '2023-10-15 18:05:00', '2023-10-15 18:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (12, 4, NULL, '2023-10-15 18:30:00', NULL, 20);

-- Ticket 13 (Cerrado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (13, 9, NULL, '2023-10-16 10:10:00', '2023-10-16 10:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (13, 3, NULL, '2023-10-16 10:30:00', '2023-10-17 10:00:00', 22);

-- Ticket 14 (Abierto, Queja)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (14, 10, NULL, '2023-10-17 11:10:00', '2023-10-17 11:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (14, 1, NULL, '2023-10-17 11:20:00', NULL, 24);

-- Ticket 15 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (15, 8, NULL, '2023-10-18 12:02:00', '2023-10-18 12:05:00', NULL);

-- Ticket 16 (Cerrado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (16, 9, NULL, '2023-10-19 14:10:00', '2023-10-19 14:30:00', NULL);

-- Ticket 17 (Escalado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (17, 6, NULL, '2023-10-20 15:05:00', '2023-10-20 15:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (17, 5, NULL, '2023-10-20 15:20:00', NULL, 28);

-- Ticket 18 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (18, 5, NULL, '2023-10-21 16:05:00', NULL, NULL);

-- Ticket 19 (Derivado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (19, 10, NULL, '2023-10-22 09:10:00', '2023-10-22 09:40:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (19, 3, NULL, '2023-10-22 09:40:00', NULL, 31);

-- Ticket 20 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (20, 7, NULL, '2023-10-23 10:02:00', '2023-10-23 10:10:00', NULL);

-- Ticket 21 (Abierto, Queja)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (21, 8, NULL, '2023-10-24 11:05:00', '2023-10-24 11:15:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (21, 2, NULL, '2023-10-24 11:15:00', NULL, 34);

-- Ticket 22 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (22, 6, NULL, '2023-10-25 19:05:00', '2023-10-25 19:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (22, 4, NULL, '2023-10-25 19:20:00', NULL, 36);

-- Ticket 23 (Cerrado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (23, 7, NULL, '2023-10-26 09:05:00', '2023-10-26 09:15:00', NULL);

-- Ticket 24 (Derivado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (24, 9, NULL, '2023-10-27 10:10:00', '2023-10-27 10:30:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (24, 5, NULL, '2023-10-27 10:30:00', NULL, 39);

-- Ticket 25 (Cerrado, Consulta)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (25, 8, NULL, '2023-10-28 11:05:00', '2023-10-28 11:30:00', NULL);

-- Ticket 26 (Abierto, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (26, 10, NULL, '2023-10-29 12:10:00', '2023-10-29 12:40:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (26, 2, NULL, '2023-10-29 12:40:00', NULL, 42);

-- Ticket 27 (Escalado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (27, 6, NULL, '2023-10-30 13:05:00', '2023-10-30 13:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (27, 3, NULL, '2023-10-30 13:20:00', NULL, 44);

-- Ticket 28 (Abierto, Queja)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (28, 4, NULL, '2023-10-31 14:05:00', NULL, NULL);

-- Ticket 29 (Derivado, Solicitud)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (29, 7, NULL, '2023-11-01 09:05:00', '2023-11-01 09:25:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (29, 5, NULL, '2023-11-01 09:25:00', NULL, 47);

-- Ticket 30 (Cerrado, Reclamo)
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (30, 8, NULL, '2023-11-02 10:05:00', '2023-11-02 10:20:00', NULL);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (30, 2, NULL, '2023-11-02 10:20:00', '2023-11-03 09:00:00', 49);
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES (30, 8, NULL, '2023-11-03 09:00:00', '2023-11-03 10:00:00', 50);

-- ==========================================
-- DOCUMENTACION (Registros de ejemplo)
-- ==========================================
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (1, 'Cliente reporta doble facturacion', 101, 'Se escala a facturacion para nota de credito', 6, 1, '2023-10-01 09:10:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (2, 'Lentitud navegacion', 205, 'Reinicio remoto de modem', 7, 3, '2023-10-02 10:15:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (3, 'Consulta roaming europa', 301, 'Se envia tarifario por mail', 8, 6, '2023-10-05 11:20:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (4, 'Solicitud baja linea 2', 404, 'Se inicia tramite administrativo', 9, 7, '2023-10-06 09:20:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (5, 'Equipo nuevo no enciende', 501, 'Derivado a garantia', 10, 9, '2023-10-07 14:20:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (6, 'Cliente molesto con seguridad', NULL, 'Se notifica a supervisor de seguridad', 10, 11, '2023-10-08 16:20:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (7, 'Aumento de plan', 105, 'Se aplica plan 50GB', 6, 13, '2023-10-10 10:10:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (8, 'Sin señal indoor', 208, 'Zona de sombra confirmada', 7, 14, '2023-10-11 11:15:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (9, 'No llega SMS saldo', 210, 'Se actualiza centro de mensajes', 8, 17, '2023-10-12 12:08:00');
INSERT INTO documentacion (id_documentacion, problema, id_articuloKB, solucion, empleado_id, id_asignacion, fecha_creacion) VALUES (10, 'Factura excesiva', 102, 'Consumo de datos excedente valido', 3, 18, '2023-10-13 10:00:00');

SET FOREIGN_KEY_CHECKS = 1;
