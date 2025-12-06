-- V9: Insert survey templates, encuestas and respuestas for closed tickets
-- This migration:
-- 1) Ensures templates (agente & servicio), questions and options exist
-- 2) Inserts one AGENTE and one SERVICIO `encuestas` row per ticket with estado='CERRADO'
-- 3) Inserts `respuestas_encuesta` rows with deterministic calificacion = (ticket_id % 5) + 1
-- 4) Inserts `respuestas_pregunta` values derived from the calificacion

SET FOREIGN_KEY_CHECKS = 0;

-- 0. Ensure plantillas (id 1 = AGENTE, id 2 = SERVICIO)
INSERT INTO plantillas_encuesta (id_plantilla_encuesta, nombre, descripcion, vigente, alcance_evaluacion)
SELECT 1, 'Encuesta de Satisfacción - Agente', 'Evalúa la atención brindada por el agente', true, 'AGENTE'
WHERE NOT EXISTS (SELECT 1 FROM plantillas_encuesta WHERE id_plantilla_encuesta = 1);

INSERT INTO plantillas_encuesta (id_plantilla_encuesta, nombre, descripcion, vigente, alcance_evaluacion)
SELECT 2, 'Encuesta de Satisfacción - Servicio', 'Evalúa la calidad general del servicio', true, 'SERVICIO'
WHERE NOT EXISTS (SELECT 1 FROM plantillas_encuesta WHERE id_plantilla_encuesta = 2);

-- 1. Ensure preguntas for AGENTE (1-3) and SERVICIO (4-6)
INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 1, 1, '¿El agente fue amable durante la atención?', 'BOOLEANA', 1, true
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 1);

INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 2, 1, '¿El agente resolvió su consulta satisfactoriamente?', 'BOOLEANA', 2, true
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 2);

INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 3, 1, '¿Tiene algún comentario adicional sobre la atención recibida?', 'TEXTO', 3, false
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 3);

-- Add mandatory RADIO question for AGENTE template so every plantilla has a RADIO question
INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 7, 1, '¿Cómo calificaría la atención del agente en general?', 'RADIO', 4, true
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 7);
INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 4, 2, '¿Recomendaría nuestro servicio?', 'BOOLEANA', 1, true
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 4);

INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 5, 2, '¿Cómo calificaría la calidad general del servicio?', 'RADIO', 2, true
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 5);

INSERT INTO preguntas (id_pregunta, plantilla_id, texto, tipo_pregunta, orden, obligatoria)
SELECT 6, 2, '¿Tiene sugerencias para mejorar nuestro servicio?', 'TEXTO', 3, false
WHERE NOT EXISTS (SELECT 1 FROM preguntas WHERE id_pregunta = 6);

-- 2. Ensure opciones for pregunta RADIO (id 5)
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 1, 5, 'Muy Malo', 1 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 1 AND pregunta_id = 5);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 2, 5, 'Malo', 2 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 2 AND pregunta_id = 5);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 3, 5, 'Regular', 3 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 3 AND pregunta_id = 5);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 4, 5, 'Bueno', 4 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 4 AND pregunta_id = 5);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 5, 5, 'Muy Bueno', 5 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 5 AND pregunta_id = 5);

-- Options for AGENTE radio pregunta (id 7) - use new option ids to avoid PK collision
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 6, 7, 'Muy Malo', 1 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 6 AND pregunta_id = 7);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 7, 7, 'Malo', 2 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 7 AND pregunta_id = 7);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 8, 7, 'Regular', 3 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 8 AND pregunta_id = 7);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 9, 7, 'Bueno', 4 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 9 AND pregunta_id = 7);
INSERT INTO opciones_pregunta (id_opcion, pregunta_id, texto, orden)
SELECT 10, 7, 'Muy Bueno', 5 WHERE NOT EXISTS (SELECT 1 FROM opciones_pregunta WHERE id_opcion = 10 AND pregunta_id = 7);
-- 3. Insert encuestas for closed tickets
-- Create AGENTE encuestas (agent may be NULL if not tracked)
INSERT INTO encuestas (plantilla_id, ticket_id, agente_id, cliente_id, alcance_evaluacion, estado_encuesta, fecha_envio, fecha_expiracion, resend_count)
SELECT 1, t.id_ticket, NULL, t.cliente_id, 'AGENTE', 'RESPONDIDA', COALESCE(t.fecha_cierre, t.fecha_creacion, NOW()), DATE_ADD(COALESCE(t.fecha_cierre, t.fecha_creacion, NOW()), INTERVAL 30 DAY), 0
FROM tickets t
WHERE t.estado = 'CERRADO'
  AND NOT EXISTS (SELECT 1 FROM encuestas e WHERE e.ticket_id = t.id_ticket AND e.plantilla_id = 1);

-- Create SERVICIO encuestas
INSERT INTO encuestas (plantilla_id, ticket_id, agente_id, cliente_id, alcance_evaluacion, estado_encuesta, fecha_envio, fecha_expiracion, resend_count)
SELECT 2, t.id_ticket, NULL, t.cliente_id, 'SERVICIO', 'RESPONDIDA', COALESCE(t.fecha_cierre, t.fecha_creacion, NOW()), DATE_ADD(COALESCE(t.fecha_cierre, t.fecha_creacion, NOW()), INTERVAL 30 DAY), 0
FROM tickets t
WHERE t.estado = 'CERRADO'
  AND NOT EXISTS (SELECT 1 FROM encuestas e WHERE e.ticket_id = t.id_ticket AND e.plantilla_id = 2);

-- 4. Insert respuestas_encuesta for encuestas we just created (idempotent)
INSERT INTO respuestas_encuesta (encuesta_id, fecha_respuesta, calificacion)
SELECT e.id_encuesta, DATE_ADD(e.fecha_envio, INTERVAL 1 HOUR) as fecha_respuesta, (MOD(e.ticket_id,5) + 1) as calificacion
FROM encuestas e
WHERE e.estado_encuesta = 'RESPONDIDA'
  AND NOT EXISTS (SELECT 1 FROM respuestas_encuesta r WHERE r.encuesta_id = e.id_encuesta)
  AND e.plantilla_id IN (1,2);

-- 5. Insert respuestas_pregunta derived from calificacion
-- For AGENTE (preguntas 1,2 -> Sí/No ; pregunta 3 -> texto)
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 1,
       CASE WHEN r.calificacion >= 4 THEN 'Sí' ELSE 'No' END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 1
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 1);

INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 2,
       CASE WHEN r.calificacion >= 4 THEN 'Sí' ELSE 'No' END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 1
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 2);

INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 3,
       CASE r.calificacion
         WHEN 5 THEN 'Excelente atención, muy amable y resolvió mi problema rápidamente.'
         WHEN 4 THEN 'Buena atención, resolución satisfactoria.'
         WHEN 3 THEN 'Atención aceptable, hubo demoras.'
         WHEN 2 THEN 'No estoy satisfecho con la atención.'
         ELSE 'Muy mala atención, insatisfecho.'
       END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 1
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 3);

-- Insert AGENTE radio respuesta (pregunta 7) derived from calificacion
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 7,
       CASE r.calificacion
         WHEN 1 THEN '6'
         WHEN 2 THEN '7'
         WHEN 3 THEN '8'
         WHEN 4 THEN '9'
         ELSE '10'
       END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 1
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 7);

-- For SERVICIO (pregunta 4 boolean, pregunta 5 radio, pregunta 6 texto)
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 4,
       CASE WHEN r.calificacion >= 4 THEN 'Sí' ELSE 'No' END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 2
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 4);

INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 5,
       CASE r.calificacion
         WHEN 1 THEN '1'
         WHEN 2 THEN '2'
         WHEN 3 THEN '3'
         WHEN 4 THEN '4'
         ELSE '5'
       END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 2
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 5);

INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, valor)
SELECT r.id_respuesta_encuesta, 6,
       CASE r.calificacion
         WHEN 5 THEN 'Servicio excelente, superó expectativas.'
         WHEN 4 THEN 'Servicio bueno, satisfecho.'
         WHEN 3 THEN 'Servicio regular, con áreas de mejora.'
         WHEN 2 THEN 'Servicio deficiente, hubo problemas.'
         ELSE 'Servicio muy malo, insatisfactorio.'
       END
FROM respuestas_encuesta r
JOIN encuestas e ON e.id_encuesta = r.encuesta_id
WHERE e.plantilla_id = 2
  AND NOT EXISTS (SELECT 1 FROM respuestas_pregunta rp WHERE rp.respuesta_encuesta_id = r.id_respuesta_encuesta AND rp.pregunta_id = 6);

SET FOREIGN_KEY_CHECKS = 1;

-- End V9
