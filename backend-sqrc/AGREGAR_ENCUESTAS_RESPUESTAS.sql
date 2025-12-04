-- =====================================================
-- EJECUTAR EN MySQL Workbench para agregar encuestas y respuestas
-- Esto permite que las tablas de "Respuestas de encuestas" muestren datos
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes
DELETE FROM respuestas_pregunta;
DELETE FROM respuestas_encuesta;
DELETE FROM encuestas WHERE id_encuesta >= 100;
DELETE FROM opciones_pregunta;
DELETE FROM preguntas;
DELETE FROM plantillas_encuesta;

-- ==========================================
-- 0. PLANTILLAS DE ENCUESTA
-- ==========================================
INSERT INTO plantillas_encuesta (id_plantilla_encuesta, nombre, descripcion, vigente, alcance_evaluacion) VALUES
(4, 'Encuesta de Satisfacción - Agente', 'Evalúa la atención brindada por el agente', true, 'AGENTE'),
(5, 'Encuesta de Satisfacción - Servicio', 'Evalúa la calidad general del servicio', true, 'SERVICIO');

-- ==========================================
-- 0.1 PREGUNTAS DE LAS PLANTILLAS
-- ==========================================
-- Preguntas para plantilla AGENTE (id=4)
INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria) VALUES
(1, 4, '¿El agente fue amable durante la atención?', 'BOOLEANA', 1, true),
(2, 4, '¿El agente resolvió su consulta satisfactoriamente?', 'BOOLEANA', 2, true),
(3, 4, '¿Tiene algún comentario adicional sobre la atención recibida?', 'TEXTO', 3, false);

-- Preguntas para plantilla SERVICIO (id=5)
INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria) VALUES
(4, 5, '¿Recomendaría nuestro servicio?', 'BOOLEANA', 1, true),
(5, 5, '¿Cómo calificaría la calidad general del servicio?', 'RADIO', 2, true),
(6, 5, '¿Tiene sugerencias para mejorar nuestro servicio?', 'TEXTO', 3, false);

-- Opciones para pregunta RADIO (id=5)
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden) VALUES
(1, 5, 'Muy Malo', 1),
(2, 5, 'Malo', 2),
(3, 5, 'Regular', 3),
(4, 5, 'Bueno', 4),
(5, 5, 'Muy Bueno', 5);

-- ==========================================
-- 1. ENCUESTAS ENVIADAS Y RESPONDIDAS
-- ==========================================

-- Encuestas sobre AGENTES (respondidas)
INSERT INTO encuestas (id_encuesta, plantilla_id, ticket_id, agente_id, cliente_id, alcance_evaluacion, estado_encuesta, fecha_envio, fecha_expiracion, resend_count) VALUES
(100, 4, 1, 6, 1, 'AGENTE', 'RESPONDIDA', '2025-11-20 10:00:00', '2025-12-20 10:00:00', 0),
(101, 4, 2, 7, 2, 'AGENTE', 'RESPONDIDA', '2025-11-21 11:00:00', '2025-12-21 11:00:00', 0),
(102, 4, 3, 8, 3, 'AGENTE', 'RESPONDIDA', '2025-11-22 14:00:00', '2025-12-22 14:00:00', 0),
(103, 4, 4, 9, 4, 'AGENTE', 'RESPONDIDA', '2025-11-25 09:00:00', '2025-12-25 09:00:00', 0),
(104, 4, 5, 10, 5, 'AGENTE', 'RESPONDIDA', '2025-11-27 15:00:00', '2025-12-27 15:00:00', 0),
(105, 4, 6, 6, 1, 'AGENTE', 'RESPONDIDA', '2025-11-28 10:30:00', '2025-12-28 10:30:00', 0),
(106, 4, 7, 7, 2, 'AGENTE', 'RESPONDIDA', '2025-11-29 11:00:00', '2025-12-29 11:00:00', 0),
(107, 4, 8, 8, 3, 'AGENTE', 'RESPONDIDA', '2025-12-01 09:00:00', '2025-12-31 09:00:00', 0),
(108, 4, 9, 9, 4, 'AGENTE', 'RESPONDIDA', '2025-12-02 14:00:00', '2025-12-31 14:00:00', 0),
(109, 4, 10, 10, 5, 'AGENTE', 'RESPONDIDA', '2025-12-03 16:00:00', '2025-12-31 16:00:00', 0),
-- Encuestas sobre AGENTES HOY
(110, 4, 11, 6, 1, 'AGENTE', 'RESPONDIDA', '2025-12-04 08:30:00', '2025-12-31 08:30:00', 0),
(111, 4, 12, 7, 2, 'AGENTE', 'RESPONDIDA', '2025-12-04 09:15:00', '2025-12-31 09:15:00', 0),

-- Encuestas sobre SERVICIO (respondidas)
(120, 5, 1, NULL, 1, 'SERVICIO', 'RESPONDIDA', '2025-11-20 12:00:00', '2025-12-20 12:00:00', 0),
(121, 5, 2, NULL, 2, 'SERVICIO', 'RESPONDIDA', '2025-11-22 10:00:00', '2025-12-22 10:00:00', 0),
(122, 5, 3, NULL, 3, 'SERVICIO', 'RESPONDIDA', '2025-11-24 15:00:00', '2025-12-24 15:00:00', 0),
(123, 5, 4, NULL, 4, 'SERVICIO', 'RESPONDIDA', '2025-11-26 11:00:00', '2025-12-26 11:00:00', 0),
(124, 5, 5, NULL, 5, 'SERVICIO', 'RESPONDIDA', '2025-11-28 09:30:00', '2025-12-28 09:30:00', 0),
(125, 5, 6, NULL, 1, 'SERVICIO', 'RESPONDIDA', '2025-11-30 14:00:00', '2025-12-30 14:00:00', 0),
(126, 5, 7, NULL, 2, 'SERVICIO', 'RESPONDIDA', '2025-12-01 16:00:00', '2025-12-31 16:00:00', 0),
(127, 5, 8, NULL, 3, 'SERVICIO', 'RESPONDIDA', '2025-12-02 10:00:00', '2025-12-31 10:00:00', 0),
(128, 5, 9, NULL, 4, 'SERVICIO', 'RESPONDIDA', '2025-12-03 11:30:00', '2025-12-31 11:30:00', 0),
-- Encuestas sobre SERVICIO HOY
(129, 5, 10, NULL, 5, 'SERVICIO', 'RESPONDIDA', '2025-12-04 08:00:00', '2025-12-31 08:00:00', 0),
(130, 5, 11, NULL, 1, 'SERVICIO', 'RESPONDIDA', '2025-12-04 10:00:00', '2025-12-31 10:00:00', 0),

-- Encuestas PENDIENTES (enviadas pero no respondidas)
(140, 4, 13, 6, 2, 'AGENTE', 'ENVIADA', '2025-12-03 09:00:00', '2025-12-10 09:00:00', 0),
(141, 4, 14, 8, 3, 'AGENTE', 'ENVIADA', '2025-12-03 14:00:00', '2025-12-10 14:00:00', 1),
(142, 5, 15, NULL, 4, 'SERVICIO', 'ENVIADA', '2025-12-04 08:00:00', '2025-12-11 08:00:00', 0);

-- ==========================================
-- 2. RESPUESTAS DE ENCUESTAS
-- ==========================================

INSERT INTO respuestas_encuesta (id_respuesta_encuesta, encuesta_id, fecha_respuesta, calificacion) VALUES
-- Respuestas de encuestas sobre AGENTES
(1, 100, '2025-11-20 10:30:00', 5),
(2, 101, '2025-11-21 11:45:00', 4),
(3, 102, '2025-11-22 15:00:00', 5),
(4, 103, '2025-11-25 09:30:00', 3),
(5, 104, '2025-11-27 15:20:00', 4),
(6, 105, '2025-11-28 11:00:00', 5),
(7, 106, '2025-11-29 11:30:00', 4),
(8, 107, '2025-12-01 09:45:00', 5),
(9, 108, '2025-12-02 14:30:00', 4),
(10, 109, '2025-12-03 16:15:00', 5),
(11, 110, '2025-12-04 09:00:00', 5),
(12, 111, '2025-12-04 09:45:00', 4),

-- Respuestas de encuestas sobre SERVICIO
(20, 120, '2025-11-20 12:30:00', 4),
(21, 121, '2025-11-22 10:45:00', 5),
(22, 122, '2025-11-24 15:30:00', 3),
(23, 123, '2025-11-26 11:20:00', 4),
(24, 124, '2025-11-28 10:00:00', 5),
(25, 125, '2025-11-30 14:30:00', 4),
(26, 126, '2025-12-01 16:30:00', 5),
(27, 127, '2025-12-02 10:30:00', 4),
(28, 128, '2025-12-03 12:00:00', 5),
(29, 129, '2025-12-04 08:30:00', 4),
(30, 130, '2025-12-04 10:30:00', 5);

-- ==========================================
-- 3. RESPUESTAS INDIVIDUALES (por pregunta)
-- ==========================================
-- Asumiendo que las preguntas son:
-- pregunta 1: "¿Fue amable el agente?" (Booleana)
-- pregunta 2: "¿Resolvió su consulta?" (Booleana)
-- pregunta 3: "Comentarios adicionales" (Texto)

-- Para las respuestas de agentes (respuesta_encuesta_id 1-12)
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor) VALUES
-- Respuesta 1 (Sofia, cliente 1)
(1, 1, 'Sí'),
(1, 2, 'Sí'),
(1, 3, 'Excelente atención, muy amable y resolvió mi problema rápidamente.'),

-- Respuesta 2 (Carlos, cliente 2)
(2, 1, 'Sí'),
(2, 2, 'Sí'),
(2, 3, 'Buena atención, aunque tardó un poco en resolver.'),

-- Respuesta 3 (Ana, cliente 3)
(3, 1, 'Sí'),
(3, 2, 'Sí'),
(3, 3, 'Muy profesional y eficiente, la mejor atención que he recibido.'),

-- Respuesta 4 (Luis, cliente 4)
(4, 1, 'Sí'),
(4, 2, 'No'),
(4, 3, 'El agente fue amable pero no logró resolver mi problema completamente.'),

-- Respuesta 5 (Pedro, cliente 5)
(5, 1, 'Sí'),
(5, 2, 'Sí'),
(5, 3, 'Atención correcta y resolutiva.'),

-- Respuesta 6 (Sofia, cliente 1 - segunda vez)
(6, 1, 'Sí'),
(6, 2, 'Sí'),
(6, 3, 'Como siempre, Sofia brinda un servicio excepcional.'),

-- Respuesta 7 (Carlos, cliente 2)
(7, 1, 'Sí'),
(7, 2, 'Sí'),
(7, 3, 'Buena atención y seguimiento del caso.'),

-- Respuesta 8 (Ana, cliente 3)
(8, 1, 'Sí'),
(8, 2, 'Sí'),
(8, 3, 'Resolvió todo en una sola llamada, muy satisfecho.'),

-- Respuesta 9 (Luis, cliente 4)
(9, 1, 'Sí'),
(9, 2, 'Sí'),
(9, 3, 'Mejoró desde la última vez, buen servicio.'),

-- Respuesta 10 (Pedro, cliente 5)
(10, 1, 'Sí'),
(10, 2, 'Sí'),
(10, 3, 'Excelente, muy recomendado.'),

-- Respuesta 11 (Sofia HOY)
(11, 1, 'Sí'),
(11, 2, 'Sí'),
(11, 3, 'Atención rápida y efectiva esta mañana.'),

-- Respuesta 12 (Carlos HOY)
(12, 1, 'Sí'),
(12, 2, 'Sí'),
(12, 3, 'Resolvió mi consulta sin problemas.');

-- Para las respuestas de servicio (respuesta_encuesta_id 20-30)
-- Asumiendo preguntas de servicio diferentes (pregunta_id 4, 5, 6)
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor) VALUES
-- Respuesta 20
(20, 4, 'Sí'),
(20, 5, 'Bueno'),
(20, 6, 'El servicio de internet es estable, aunque la facturación podría ser más clara.'),

-- Respuesta 21
(21, 4, 'Sí'),
(21, 5, 'Muy Bueno'),
(21, 6, 'Muy satisfecho con la velocidad y estabilidad del servicio.'),

-- Respuesta 22
(22, 4, 'No'),
(22, 5, 'Regular'),
(22, 6, 'He tenido algunas caídas del servicio este mes.'),

-- Respuesta 23
(23, 4, 'Sí'),
(23, 5, 'Bueno'),
(23, 6, 'Buen servicio en general, precio competitivo.'),

-- Respuesta 24
(24, 4, 'Sí'),
(24, 5, 'Muy Bueno'),
(24, 6, 'Excelente relación calidad-precio.'),

-- Respuesta 25
(25, 4, 'Sí'),
(25, 5, 'Bueno'),
(25, 6, 'Servicio confiable, recomendado.'),

-- Respuesta 26
(26, 4, 'Sí'),
(26, 5, 'Muy Bueno'),
(26, 6, 'El mejor servicio de telecomunicaciones que he tenido.'),

-- Respuesta 27
(27, 4, 'Sí'),
(27, 5, 'Bueno'),
(27, 6, 'Cumple con lo prometido.'),

-- Respuesta 28
(28, 4, 'Sí'),
(28, 5, 'Muy Bueno'),
(28, 6, 'Muy contento con el servicio, especialmente la atención al cliente.'),

-- Respuesta 29 (HOY)
(29, 4, 'Sí'),
(29, 5, 'Bueno'),
(29, 6, 'Servicio consistente y confiable.'),

-- Respuesta 30 (HOY)
(30, 4, 'Sí'),
(30, 5, 'Muy Bueno'),
(30, 6, 'Muy satisfecho, lo recomiendo ampliamente.');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- RESUMEN:
-- 12 encuestas sobre AGENTES respondidas
-- 11 encuestas sobre SERVICIO respondidas
-- 3 encuestas PENDIENTES (enviadas pero sin respuesta)
-- Cada respuesta tiene calificación (1-5) y comentarios
-- =====================================================
