-- ============================================================================
-- SCRIPT DE INSERCIÓN DE DATOS - BASE DE CONOCIMIENTO
-- Módulo SQRC - Sistema de Solicitudes, Quejas, Reclamos y Consultas
-- ============================================================================
-- IMPORTANTE: Ejecutar después de tener empleados en la tabla 'empleados'
-- Los id_creador e id_ultimo_editor deben existir en la tabla empleados
-- ============================================================================

-- ============================================================================
-- TABLA: articulos
-- Nota: id_creador e id_ultimo_editor son FK a empleados(id_empleado)
-- ============================================================================

INSERT INTO articulos (
    actualizado_en, creado_en, id_creador, id_ultimo_editor, 
    vigente_desde, vigente_hasta, codigo, tags, resumen, titulo, 
    etiqueta, tipo_caso, visibilidad
) VALUES 
(NULL, '2025-12-01 23:47:20.000000', 1, NULL, 
 '2025-01-01 00:00:00.000000', '2026-12-31 23:59:59.000000', 
 'KB-001-4G', '4g, lte, configuración, android, ios, datos móviles, internet móvil, apn', 
 'Guía paso a paso para configurar la conexión 4G/LTE en smartphones Android e iOS.', 
 'Configuración de Red 4G/LTE en Dispositivos Móviles', 
 'GUIAS', 'CONSULTA', 'AGENTE'),

(NULL, '2025-12-01 23:47:20.000000', 2, NULL, 
 '2025-01-01 00:00:00.000000', '2026-06-30 23:59:59.000000', 
 'KB-002-ROAM', 'roaming, internacional, viajes, tarifas, activación, exterior, llamadas internacionales', 
 'Procedimiento para activar el servicio de roaming y tarifas aplicables por zona.', 
 'Activación y Uso del Roaming Internacional', 
 'POLITICAS', 'SOLICITUD', 'SUPERVISOR'),

(NULL, '2025-12-01 23:47:20.000000', 4, NULL, 
 '2025-02-01 00:00:00.000000', NULL, 
 'KB-003-FIBRA', 'fibra óptica, ftth, lentitud, desconexión, router, ont, modem, wifi, velocidad', 
 'Diagnóstico y solución de problemas comunes en servicios de fibra óptica residencial.', 
 'Solución de Problemas de Conexión Fibra Óptica', 
 'TROUBLESHOOTING', 'RECLAMO', 'AGENTE'),

(NULL, '2025-12-01 23:47:20.000000', 3, NULL, 
 '2025-01-15 00:00:00.000000', '2026-12-31 23:59:59.000000', 
 'KB-004-PORT', 'portabilidad, cambio de operador, número, migración, claro, movistar, entel, bitel', 
 'Requisitos y pasos para realizar la portabilidad de número desde otros operadores.', 
 'Proceso de Portabilidad Numérica', 
 'INSTRUCTIVOS', 'SOLICITUD', 'AGENTE'),

(NULL, '2025-12-01 23:47:20.000000', 2, NULL, 
 '2025-01-01 00:00:00.000000', NULL, 
 'KB-005-FACT', 'factura, pago, recibo, deuda, mora, pronto pago, descuento, cuota, mensualidad', 
 'Respuestas a las preguntas más comunes sobre facturación, pagos y estados de cuenta.', 
 'Consultas Frecuentes sobre Facturación', 
 'FAQS', 'QUEJA', 'AGENTE'),

(NULL, '2025-12-01 23:47:20.000000', 5, NULL, 
 '2025-03-01 00:00:00.000000', '2025-12-31 23:59:59.000000', 
 'KB-006-CORP', 'postpago, empresas, corporativo, flotas, ruc, planes, beneficios, descuentos volumen', 
 'Descripción de planes corporativos, beneficios y requisitos de contratación.', 
 'Planes Postpago para Empresas', 
 'DESCRIPCIONES', 'CONSULTA', 'SUPERVISOR'),

(NULL, '2025-12-01 23:47:20.000000', 1, NULL, 
 '2025-06-01 00:00:00.000000', NULL, 
 'KB-007-5G', '5g, cobertura, compatibilidad, velocidad, latencia, smartphone, samsung, iphone, huawei', 
 'Información sobre la cobertura 5G actual y lista de dispositivos compatibles.', 
 'Red 5G: Cobertura y Dispositivos Compatibles', 
 'GUIAS', 'CONSULTA', 'AGENTE'),

(NULL, '2025-12-01 23:47:20.000000', 5, NULL, 
 '2025-01-01 00:00:00.000000', NULL, 
 'KB-008-FRAUD', 'fraude, sim swapping, robo, identidad, seguridad, bloqueo, suplantación, phishing', 
 'Procedimiento interno para gestionar casos de fraude, SIM swapping y robo de identidad.', 
 'Protocolo de Atención de Casos de Fraude', 
 'CASOS', 'RECLAMO', 'SUPERVISOR'),

(NULL, '2025-12-04 06:39:20.376093', 1, 1, 
 NULL, NULL, 
 'KB-0314275-765F', NULL, 
 'Un cliente reportó un cobro duplicado en su recibo del mes de noviembre. Se confirmó que un error del sistema generó un segundo cargo. La solución aplicada incluyó la emisión de una nota de crédito y la aplicación del saldo a favor para el próximo recibo del cliente.', 
 'Resolución de Cobro Duplicado en Recibo Mensual por Error de Sistema', 
 'TROUBLESHOOTING', 'RECLAMO', 'AGENTE'),

(NULL, '2025-12-04 07:06:34.895515', 1, 1, 
 NULL, NULL, 
 'KB-1966277-8FC0', 'fibra óptica, baja velocidad, micro-fractura, PON, diagnóstico remoto', 
 'Cliente reporta baja velocidad en su servicio de fibra óptica, recibiendo solo 15-20 Mbps de un plan de 200 Mbps. Se diagnosticó una señal óptica degradada y se resolvió reemplazando un tramo de cable con una micro-fractura.', 
 'Resolución de Baja Velocidad en Internet de Fibra Óptica por Micro-fractura en Cable', 
 'TROUBLESHOOTING', 'CONSULTA', 'AGENTE'),

(NULL, '2025-12-04 07:11:34.531589', 1, 1, 
 NULL, NULL, 
 'KB-2278576-4A85', '4G, APN, Conexión, Sin Servicio, Configuración', 
 'El cliente no puede conectarse a la red 4G con su nuevo equipo, mostrando ''Sin servicio'' a pesar de tener señal. La causa fue una configuración incorrecta del APN, la cual se solucionó manualmente.', 
 'Problema de Conexión 4G en Nuevo Dispositivo por APN Incorrecto', 
 'TROUBLESHOOTING', 'CONSULTA', 'AGENTE'),

(NULL, '2025-12-04 07:16:26.586554', 1, 1, 
 '2025-12-04 05:00:00.000000', '2025-12-28 04:59:59.000000', 
 'KB-2554659-EAED', '4G, APN, Conexión, Sin servicio, Nuevo equipo', 
 'El cliente experimenta ''Sin servicio'' en su nuevo dispositivo a pesar de tener señal, impidiendo la conexión 4G. La causa fue una configuración APN incorrecta que se solucionó manualmente.', 
 'Problema de Conexión 4G después de Cambio de Equipo por APN Incorrecto', 
 'TROUBLESHOOTING', 'CONSULTA', 'AGENTE'),

(NULL, '2025-12-04 16:36:35.279940', 1, 1, 
 '2025-12-04 05:00:00.000000', NULL, 
 'KB-1764866195207', NULL, 
 'oi', 'io', 
 'TROUBLESHOOTING', 'TODOS', 'AGENTE');


-- ============================================================================
-- TABLA: articulo_versiones
-- Nota: id_creador es FK a empleados(id_empleado)
--       id_ticket es FK a tickets(id_ticket) - puede ser NULL
-- ============================================================================

INSERT INTO articulo_versiones ( es_vigente, id_articulo, numero_version, creado_en, 
    id_creador, id_ticket, contenido, nota_cambio, estado_propuesta, origen
) VALUES 
(0, 1, 1, '2025-12-01 23:47:20.000000', 
 1, NULL, 
 '<h2>Configuración de Red 4G/LTE</h2>\n<h3>Para Android:</h3>\n<ol>\n<li>Ir a Configuración > Conexiones > Redes móviles</li>\n<li>Seleccionar \"Modo de red\"</li>\n<li>Elegir \"LTE/3G/2G (conexión automática)\"</li>\n</ol>\n<h3>Para iOS:</h3>\n<ol>\n<li>Ir a Configuración > Datos móviles > Opciones</li>\n<li>Seleccionar \"Voz y datos\"</li>\n<li>Elegir \"LTE\"</li>\n</ol>', 
 'Versión inicial con configuración básica', 'ARCHIVADO', 'MANUAL'),

(0, 1, 2, '2025-12-01 23:47:20.000000', 
 4, NULL, 
 '<h2>Configuración de Red 4G/LTE</h2>\n<h3>Para Android (versión 10+):</h3>\n<ol>\n<li>Ir a Configuración > Conexiones > Redes móviles</li>\n<li>Seleccionar \"Modo de red\"</li>\n<li>Elegir \"LTE/3G/2G (conexión automática)\"</li>\n<li>Verificar que APN esté configurado correctamente</li>\n</ol>\n<h3>Para iOS (iPhone 8 en adelante):</h3>\n<ol>\n<li>Ir a Configuración > Datos móviles > Opciones</li>\n<li>Seleccionar \"Voz y datos\"</li>\n<li>Elegir \"LTE\" o \"5G automático\"</li>\n</ol>\n<h3>APN recomendado:</h3>\n<p>Nombre: internet.empresa.pe | Usuario: (vacío) | Contraseña: (vacío)</p>', 
 'Actualización con configuración APN y versiones de OS', 'PUBLICADO', 'MANUAL'),

(1, 1, 3, '2025-12-01 23:47:20.000000', 
 1, NULL, 
 '<h2>Configuración de Red 4G/LTE - Guía Completa</h2>\n<h3>Requisitos previos:</h3>\n<ul>\n<li>SIM compatible con 4G/LTE</li>\n<li>Dispositivo con soporte 4G</li>\n<li>Cobertura 4G en la zona</li>\n</ul>\n<h3>Para Android (versión 10+):</h3>\n<ol>\n<li>Ir a Configuración > Conexiones > Redes móviles</li>\n<li>Seleccionar \"Modo de red\"</li>\n<li>Elegir \"LTE/3G/2G (conexión automática)\"</li>\n<li>Verificar que APN esté configurado correctamente</li>\n</ol>\n<h3>Para iOS (iPhone 8 en adelante):</h3>\n<ol>\n<li>Ir a Configuración > Datos móviles > Opciones</li>\n<li>Seleccionar \"Voz y datos\"</li>\n<li>Elegir \"LTE\" o \"5G automático\"</li>\n</ol>\n<h3>Configuración APN:</h3>\n<table>\n<tr><td>Nombre:</td><td>internet.empresa.pe</td></tr>\n<tr><td>APN:</td><td>internet.empresa.pe</td></tr>\n<tr><td>Usuario:</td><td>(vacío)</td></tr>\n<tr><td>Contraseña:</td><td>(vacío)</td></tr>\n<tr><td>Tipo de autenticación:</td><td>Ninguna</td></tr>\n</table>\n<h3>Solución de problemas:</h3>\n<p>Si no conecta, reiniciar el dispositivo y verificar la cobertura en la app Mi Empresa.</p>', 
 'Versión completa con requisitos y solución de problemas', 'PUBLICADO', 'MANUAL'),

(0, 2, 1, '2025-12-01 23:47:20.000000', 
 2, NULL, 
 '<h2>Roaming Internacional</h2>\n<h3>Activación:</h3>\n<p>Llamar al *123# o desde la app Mi Empresa.</p>\n<h3>Tarifas:</h3>\n<ul>\n<li>Zona 1 (Sudamérica): $1.50/min llamadas, $0.50/MB datos</li>\n<li>Zona 2 (Norteamérica/Europa): $2.50/min llamadas, $1.00/MB datos</li>\n<li>Zona 3 (Asia/Oceanía): $3.50/min llamadas, $1.50/MB datos</li>\n</ul>', 
 'Versión inicial', 'PUBLICADO', 'MANUAL'),

(1, 2, 2, '2025-12-01 23:47:20.000000', 
 2, NULL, 
 '<h2>Roaming Internacional - Política y Tarifas 2025</h2>\n<h3>¿Cómo activar el roaming?</h3>\n<ol>\n<li>Desde la app Mi Empresa: Servicios > Roaming > Activar</li>\n<li>Marcando *123*1# desde tu línea</li>\n<li>Llamando a atención al cliente 24/7</li>\n</ol>\n<h3>Requisitos:</h3>\n<ul>\n<li>Línea activa con antigüedad mínima de 3 meses</li>\n<li>Sin deuda pendiente</li>\n<li>Depósito de garantía según historial crediticio</li>\n</ul>\n<h3>Tarifas por zona (vigentes desde Enero 2025):</h3>\n<table>\n<tr><th>Zona</th><th>Países</th><th>Llamadas/min</th><th>Datos/MB</th><th>SMS</th></tr>\n<tr><td>1</td><td>Chile, Colombia, Ecuador, Bolivia</td><td>$1.20</td><td>$0.40</td><td>$0.30</td></tr>\n<tr><td>2</td><td>USA, Canadá, España, Italia, Francia</td><td>$2.00</td><td>$0.80</td><td>$0.50</td></tr>\n<tr><td>3</td><td>Japón, China, Australia, Emiratos</td><td>$3.00</td><td>$1.20</td><td>$0.80</td></tr>\n</table>\n<h3>Paquetes de roaming (recomendados):</h3>\n<ul>\n<li>Pack Viajero 3 días: 1GB + 30 min llamadas = $25</li>\n<li>Pack Viajero 7 días: 3GB + 60 min llamadas = $50</li>\n<li>Pack Viajero 15 días: 5GB + 120 min llamadas = $80</li>\n</ul>', 
 'Actualización de tarifas 2025 y nuevos paquetes', 'PUBLICADO', 'MANUAL'),

(0, 3, 1, '2025-12-01 23:47:20.000000', 
 4, NULL, 
 '<h2>Troubleshooting Fibra Óptica</h2>\n<h3>Problema: Sin conexión a internet</h3>\n<ol>\n<li>Verificar luz PON del ONT (debe estar verde fija)</li>\n<li>Reiniciar ONT y router desconectando 30 segundos</li>\n<li>Verificar cables de fibra no estén doblados</li>\n<li>Si persiste, escalar a soporte técnico nivel 2</li>\n</ol>', 
 'Versión inicial', 'ARCHIVADO', 'MANUAL'),

(1, 3, 2, '2025-12-01 23:47:20.000000', 
 4, NULL, 
 '<h2>Solución de Problemas - Fibra Óptica Residencial</h2>\n<h3>Diagnóstico inicial:</h3>\n<p>Verificar indicadores LED del ONT:</p>\n<ul>\n<li><strong>POWER:</strong> Verde = OK, Apagado = Sin energía</li>\n<li><strong>PON:</strong> Verde fijo = Conexión OK, Parpadeando = Sincronizando, Rojo = Sin señal óptica</li>\n<li><strong>LAN:</strong> Verde = Puerto activo</li>\n<li><strong>INTERNET:</strong> Verde = IP asignada, Rojo = Sin autenticación</li>\n</ul>\n\n<h3>Problema 1: Sin conexión total</h3>\n<ol>\n<li>Verificar que el ONT tenga energía (luz POWER encendida)</li>\n<li>Verificar luz PON - si está roja o apagada, revisar conexión de fibra</li>\n<li>Reiniciar ONT desconectando 30 segundos</li>\n<li>Si PON sigue roja, verificar que el cable de fibra no esté doblado o dañado</li>\n<li>Escalar a técnico de campo si el problema persiste</li>\n</ol>\n\n<h3>Problema 2: Velocidad lenta</h3>\n<ol>\n<li>Realizar test de velocidad en fast.com conectado por cable</li>\n<li>Verificar que no haya otros dispositivos consumiendo ancho de banda</li>\n<li>Cambiar canal WiFi si hay interferencia (usar app WiFi Analyzer)</li>\n<li>Verificar plan contratado vs velocidad medida</li>\n<li>Si es menor al 80% del plan, escalar a NOC</li>\n</ol>\n\n<h3>Problema 3: Cortes intermitentes</h3>\n<ol>\n<li>Revisar historial de cortes en el sistema de monitoreo</li>\n<li>Verificar si hay trabajos programados en la zona</li>\n<li>Revisar conexiones físicas en la roseta óptica</li>\n<li>Programar visita técnica si hay más de 3 cortes en una semana</li>\n</ol>\n\n<h3>Códigos de escalamiento:</h3>\n<ul>\n<li>ESC-NOC-001: Problema de señal óptica</li>\n<li>ESC-NOC-002: Problema de velocidad</li>\n<li>ESC-CAMPO-001: Revisión de acometida</li>\n</ul>', 
 'Guía completa de troubleshooting con códigos de escalamiento', 'PUBLICADO', 'MANUAL'),

(1, 4, 1, '2025-12-01 23:47:20.000000', 
 3, NULL, 
 '<h2>Portabilidad Numérica - Proceso Completo</h2>\n\n<h3>¿Qué es la portabilidad?</h3>\n<p>Es el derecho que tienen los usuarios de telefonía móvil de cambiar de operador manteniendo su número telefónico.</p>\n\n<h3>Requisitos:</h3>\n<ul>\n<li>DNI vigente del titular de la línea</li>\n<li>Línea activa (no suspendida por deuda mayor a 60 días)</li>\n<li>No haber portado en los últimos 6 meses</li>\n<li>Recibo o constancia del operador actual</li>\n</ul>\n\n<h3>Proceso paso a paso:</h3>\n<ol>\n<li><strong>Validación (Día 0):</strong> Verificar requisitos y elegibilidad del cliente</li>\n<li><strong>Registro (Día 0):</strong> Ingresar solicitud en sistema SIPORT</li>\n<li><strong>Confirmación (Día 1-2):</strong> Cliente recibe SMS de confirmación</li>\n<li><strong>Ventana de portabilidad (Día 7):</strong> Se ejecuta el cambio entre las 00:00 y 06:00 hrs</li>\n<li><strong>Activación (Día 7):</strong> Cliente debe insertar nueva SIM y reiniciar</li>\n</ol>\n\n<h3>Estados en sistema:</h3>\n<ul>\n<li><strong>PENDIENTE:</strong> Solicitud registrada</li>\n<li><strong>EN_PROCESO:</strong> Aprobada por operador cedente</li>\n<li><strong>RECHAZADA:</strong> Verificar motivo en sistema</li>\n<li><strong>COMPLETADA:</strong> Portabilidad exitosa</li>\n</ul>\n\n<h3>Motivos comunes de rechazo:</h3>\n<ul>\n<li>Deuda pendiente mayor a 60 días</li>\n<li>Línea con contrato vigente con penalidad</li>\n<li>Datos incorrectos del titular</li>\n<li>Portabilidad reciente (< 6 meses)</li>\n</ul>\n\n<h3>Tiempo máximo:</h3>\n<p>7 días hábiles desde la solicitud según regulación OSIPTEL.</p>', 
 'Versión inicial completa', 'PUBLICADO', 'MANUAL'),

(0, 5, 1, '2025-12-01 23:47:20.000000', 
 2, NULL, 
 '<h2>FAQ Facturación</h2>\n<h3>¿Cuándo llega mi recibo?</h3>\n<p>El recibo se emite el día 15 de cada mes.</p>\n<h3>¿Cómo pago?</h3>\n<p>Puede pagar en bancos, agentes o la app.</p>', 
 'Versión inicial básica', 'ARCHIVADO', 'MANUAL'),

(1, 5, 2, '2025-12-01 23:47:20.000000', 
 2, NULL, 
 '<h2>Preguntas Frecuentes - Facturación y Pagos</h2>\n\n<h3>1. ¿Cuándo se emite mi recibo?</h3>\n<p>Los recibos se emiten según el ciclo de facturación asignado:</p>\n<ul>\n<li>Ciclo 1: día 5 de cada mes</li>\n<li>Ciclo 2: día 15 de cada mes</li>\n<li>Ciclo 3: día 25 de cada mes</li>\n</ul>\n\n<h3>2. ¿Cuáles son los medios de pago disponibles?</h3>\n<ul>\n<li><strong>App Mi Empresa:</strong> Pago con tarjeta, débito automático</li>\n<li><strong>Bancos:</strong> BCP, BBVA, Interbank, Scotiabank (ventanilla, app, web)</li>\n<li><strong>Agentes:</strong> Kasnet, Tambo, Mass, bodegas autorizadas</li>\n<li><strong>Pago en línea:</strong> www.empresa.pe/pagos</li>\n<li><strong>Débito automático:</strong> Configurar en app o llamando al *123#</li>\n</ul>\n\n<h3>3. ¿Qué pasa si no pago a tiempo?</h3>\n<table>\n<tr><th>Días de mora</th><th>Acción</th></tr>\n<tr><td>1-15 días</td><td>Cobro de interés moratorio (1.5% mensual)</td></tr>\n<tr><td>16-30 días</td><td>Suspensión parcial (solo llamadas entrantes)</td></tr>\n<tr><td>31-60 días</td><td>Suspensión total del servicio</td></tr>\n<tr><td>+60 días</td><td>Baja definitiva y reporte a centrales de riesgo</td></tr>\n</table>\n\n<h3>4. ¿Cómo obtengo descuento por pronto pago?</h3>\n<p>Pagando hasta 5 días después de la emisión del recibo, obtiene 5% de descuento en el cargo fijo.</p>\n\n<h3>5. ¿Cómo solicito factura electrónica?</h3>\n<ol>\n<li>Ingresar a la app Mi Empresa</li>\n<li>Ir a Configuración > Facturación</li>\n<li>Activar \"Recibir factura por email\"</li>\n<li>Ingresar el correo donde desea recibirla</li>\n</ol>\n\n<h3>6. ¿Cómo reclamo un cobro indebido?</h3>\n<p>Tiene 30 días desde la emisión para reclamar. Puede hacerlo:</p>\n<ul>\n<li>App: Soporte > Reclamos > Nuevo reclamo</li>\n<li>Web: www.empresa.pe/reclamos</li>\n<li>Libro de reclamaciones en cualquier tienda</li>\n</ul>', 
 'FAQ completo con todos los escenarios', 'PUBLICADO', 'MANUAL'),

(1, 6, 1, '2025-12-01 23:47:20.000000', 
 5, NULL, 
 '<h2>Planes Postpago Empresariales 2025</h2>\n\n<h3>Requisitos para contratar:</h3>\n<ul>\n<li>RUC activo y habido</li>\n<li>Antigüedad mínima de la empresa: 1 año</li>\n<li>Mínimo 5 líneas para plan flota</li>\n<li>Carta de autorización del representante legal</li>\n<li>Última declaración de impuestos</li>\n</ul>\n\n<h3>Planes disponibles:</h3>\n<table>\n<tr><th>Plan</th><th>Datos</th><th>Minutos</th><th>Beneficios</th><th>Precio/línea</th></tr>\n<tr><td>Empresarial Básico</td><td>10 GB</td><td>Ilimitados</td><td>Llamadas a flota gratis</td><td>S/ 59</td></tr>\n<tr><td>Empresarial Plus</td><td>25 GB</td><td>Ilimitados</td><td>+ Roaming Latam</td><td>S/ 89</td></tr>\n<tr><td>Empresarial Premium</td><td>50 GB</td><td>Ilimitados</td><td>+ 5G + Roaming Global</td><td>S/ 129</td></tr>\n<tr><td>Empresarial Unlimited</td><td>Ilimitados</td><td>Ilimitados</td><td>Todo incluido + Soporte VIP</td><td>S/ 199</td></tr>\n</table>\n\n<h3>Descuentos por volumen:</h3>\n<ul>\n<li>5-10 líneas: 10% descuento</li>\n<li>11-25 líneas: 15% descuento</li>\n<li>26-50 líneas: 20% descuento</li>\n<li>+50 líneas: Negociación directa con ejecutivo</li>\n</ul>\n\n<h3>Servicios adicionales:</h3>\n<ul>\n<li>MDM (Mobile Device Management): S/ 15/línea</li>\n<li>Seguro de equipos: S/ 10/línea</li>\n<li>Líneas de respaldo: S/ 25/línea</li>\n<li>Reportes de consumo: Incluido</li>\n</ul>\n\n<h3>Proceso de contratación:</h3>\n<ol>\n<li>Contactar ejecutivo corporativo</li>\n<li>Enviar documentación requerida</li>\n<li>Evaluación crediticia (24-48 hrs)</li>\n<li>Firma de contrato</li>\n<li>Entrega de equipos y SIMs (3-5 días)</li>\n</ol>', 
 'Versión inicial con planes 2025', 'PUBLICADO', 'MANUAL'),

(0, 7, 1, '2025-12-01 23:47:20.000000', 
 1, NULL, 
 '<h2>Red 5G - Información Inicial</h2>\n<p>Próximamente disponible en Lima Metropolitana.</p>\n<p>Dispositivos compatibles: iPhone 12+, Samsung S21+</p>', 
 'Versión inicial - lanzamiento 5G', 'ARCHIVADO', 'MANUAL'),

(0, 7, 2, '2025-12-01 23:47:20.000000', 
 1, NULL, 
 '<h2>Red 5G - Cobertura Inicial</h2>\n<h3>Zonas con cobertura:</h3>\n<ul>\n<li>Miraflores</li>\n<li>San Isidro</li>\n<li>San Borja</li>\n</ul>\n<h3>Dispositivos compatibles:</h3>\n<ul>\n<li>iPhone 12, 13, 14, 15</li>\n<li>Samsung Galaxy S21, S22, S23, S24</li>\n<li>Xiaomi 12, 13, 14</li>\n</ul>', 
 'Actualización con zonas de cobertura', 'PUBLICADO', 'MANUAL'),

(1, 7, 3, '2025-12-01 23:47:20.000000', 
 1, NULL, 
 '<h2>Red 5G - Cobertura y Dispositivos Compatibles</h2>\n\n<h3>¿Qué es 5G?</h3>\n<p>La quinta generación de tecnología móvil que ofrece velocidades hasta 20x más rápidas que 4G, menor latencia y mayor capacidad de conexiones simultáneas.</p>\n\n<h3>Beneficios del 5G:</h3>\n<ul>\n<li><strong>Velocidad:</strong> Hasta 1 Gbps de descarga</li>\n<li><strong>Latencia:</strong> Menos de 10ms (ideal para gaming y videollamadas)</li>\n<li><strong>Capacidad:</strong> Más dispositivos conectados sin afectar velocidad</li>\n</ul>\n\n<h3>Cobertura actual (Diciembre 2025):</h3>\n<h4>Lima Metropolitana:</h4>\n<ul>\n<li>Miraflores (100%)</li>\n<li>San Isidro (100%)</li>\n<li>San Borja (100%)</li>\n<li>Surco (80%)</li>\n<li>La Molina (70%)</li>\n<li>Barranco (100%)</li>\n<li>Pueblo Libre (60%)</li>\n</ul>\n\n<h4>Provincias:</h4>\n<ul>\n<li>Arequipa - Centro y Cayma</li>\n<li>Trujillo - Centro histórico</li>\n<li>Piura - Centro</li>\n</ul>\n\n<h3>Dispositivos compatibles:</h3>\n<table>\n<tr><th>Marca</th><th>Modelos</th></tr>\n<tr><td>Apple</td><td>iPhone 12, 12 Pro, 13, 13 Pro, 14, 14 Pro, 15, 15 Pro</td></tr>\n<tr><td>Samsung</td><td>Galaxy S21/S21+/S21 Ultra, S22 series, S23 series, S24 series, Z Fold 3/4/5, Z Flip 3/4/5</td></tr>\n<tr><td>Xiaomi</td><td>Mi 11, 12, 13, 14, Redmi Note 12 Pro+ 5G</td></tr>\n<tr><td>Huawei</td><td>P50 Pro, Mate 50, Nova 11</td></tr>\n<tr><td>Motorola</td><td>Edge 30, 40, 50 series</td></tr>\n<tr><td>OnePlus</td><td>9, 10, 11, 12</td></tr>\n</table>\n\n<h3>¿Cómo activar 5G?</h3>\n<ol>\n<li>Verificar que tu dispositivo sea compatible</li>\n<li>Verificar cobertura 5G en tu zona (app Mi Empresa)</li>\n<li>Ir a Configuración > Redes móviles > Modo de red</li>\n<li>Seleccionar \"5G/LTE/3G/2G automático\"</li>\n<li>Si no aparece 5G, actualizar configuración de operador</li>\n</ol>\n\n<h3>¿Tiene costo adicional?</h3>\n<p>No. El acceso a la red 5G está incluido en todos los planes postpago sin costo adicional. Solo necesitas un dispositivo compatible.</p>\n\n<h3>Mapa de cobertura:</h3>\n<p>Consulta el mapa interactivo en: www.empresa.pe/cobertura5g</p>', 
 'Versión completa con cobertura actualizada Diciembre 2025', 'PUBLICADO', 'MANUAL'),

(1, 8, 1, '2025-12-01 23:47:20.000000', 
 5, NULL, 
 '<h2>Protocolo de Atención de Casos de Fraude</h2>\n\n<h3>⚠️ DOCUMENTO CONFIDENCIAL - SOLO SUPERVISORES</h3>\n\n<h3>Tipos de fraude más comunes:</h3>\n<ol>\n<li><strong>SIM Swapping:</strong> Suplantación para obtener SIM duplicada</li>\n<li><strong>Robo de identidad:</strong> Contratación con documentos falsos</li>\n<li><strong>Fraude interno:</strong> Activaciones irregulares por empleados</li>\n<li><strong>Phishing:</strong> Obtención de datos por engaño</li>\n</ol>\n\n<h3>Protocolo de actuación inmediata:</h3>\n<ol>\n<li><strong>Bloqueo preventivo:</strong> Bloquear línea inmediatamente con código FRD-001</li>\n<li><strong>Documentación:</strong> Registrar todos los detalles en ticket tipo FRAUDE</li>\n<li><strong>Escalamiento:</strong> Notificar a Seguridad Corporativa en menos de 1 hora</li>\n<li><strong>Preservación:</strong> No modificar registros, se requieren para investigación</li>\n</ol>\n\n<h3>Validaciones obligatorias para SIM duplicada:</h3>\n<ul>\n<li>✓ DNI físico original del titular</li>\n<li>✓ Validación biométrica (huella dactilar)</li>\n<li>✓ Pregunta de seguridad registrada</li>\n<li>✓ Código de verificación enviado a email registrado</li>\n<li>✓ Llamada de confirmación al número alterno</li>\n</ul>\n\n<h3>Señales de alerta (Red Flags):</h3>\n<ul>\n<li>🚩 Cliente nervioso o apurado</li>\n<li>🚩 Desconoce información básica de la cuenta</li>\n<li>🚩 DNI con apariencia alterada</li>\n<li>🚩 Múltiples intentos de validación fallidos</li>\n<li>🚩 Solicitud desde ubicación inusual</li>\n<li>🚩 Cambio reciente de datos de contacto</li>\n</ul>\n\n<h3>Proceso de investigación:</h3>\n<ol>\n<li>Seguridad revisa logs de acceso y cambios</li>\n<li>Análisis de patrones en sistema antifraude</li>\n<li>Entrevista a personal involucrado si aplica</li>\n<li>Reporte a Indecopi/Fiscalía si corresponde</li>\n<li>Reembolso al cliente afectado según política</li>\n</ol>\n\n<h3>Contactos de emergencia:</h3>\n<ul>\n<li>Seguridad Corporativa: interno 5555 (24/7)</li>\n<li>Jefe de Fraude: interno 5560 (L-V 8-18)</li>\n<li>Legal: interno 5570 (L-V 9-18)</li>\n</ul>\n\n<h3>Política de reembolso:</h3>\n<p>Si se confirma fraude, el cliente recibe:</p>\n<ul>\n<li>Reembolso del 100% de consumos fraudulentos</li>\n<li>Nueva SIM sin costo</li>\n<li>Monitoreo especial por 6 meses</li>\n<li>Carta de disculpas formal</li>\n</ul>', 
 'Protocolo inicial de fraude - CONFIDENCIAL', 'PUBLICADO', 'MANUAL'),

(0, 9, 1, '2025-12-04 06:39:20.397703', 
 1, NULL, 
 '<h2>Descripción del Problema</h2><p>El cliente reclamó un cobro duplicado por el mismo monto (S/89.90) en su recibo del mes de noviembre, indicando haber realizado un pago el día 5 y otro el día 15. El cliente adjuntó comprobantes de ambos pagos para validar su reclamo.</p><h2>Causa</h2><p>Se revisó el historial de pagos del cliente en el sistema, confirmando la existencia de dos cargos idénticos para el mismo período. Se determinó que, aunque el primer pago fue procesado correctamente, un error interno del sistema generó un segundo cargo de manera errónea.</p><h2>Solución</h2><p>Se aplicó una solución integral para corregir el cobro duplicado y restaurar la conformidad del cliente. Esta incluyó la emisión de una nota de crédito por el monto excedente, la aplicación de dicho saldo a favor para el próximo recibo y una comunicación proactiva al cliente para confirmar los ajustes.</p><h2>Pasos a seguir</h2><ol><li><strong>Verificar historial de pagos:</strong> Acceder al sistema CRM y revisar detalladamente el historial de pagos del cliente para el período en cuestión, confirmando la existencia de cobros duplicados.</li><li><strong>Validar comprobantes:</strong> Cotejar los comprobantes de pago proporcionados por el cliente con los registros del sistema para asegurar la exactitud del reclamo.</li><li><strong>Identificar origen del error:</strong> Confirmar que el cobro duplicado se debió a un error del sistema en la generación de un segundo cargo.</li><li><strong>Emitir Nota de Crédito:</strong> Proceder con la emisión de una nota de crédito por el monto exacto del cobro duplicado (ej. S/89.90).</li><li><strong>Aplicar Saldo a Favor:</strong> Configurar el sistema para que el saldo a favor generado por la nota de crédito se aplique automáticamente al próximo recibo del cliente.</li><li><strong>Comunicar al cliente:</strong> Enviar un correo electrónico de confirmación al cliente, detallando el ajuste realizado, el número de la nota de crédito y la forma en que el saldo a favor se reflejará en su próxima factura.</li><li><strong>Cerrar el ticket:</strong> Registrar todos los pasos y la resolución final en el ticket del cliente, marcándolo como resuelto.</li></ol><h2>Notas adicionales</h2><ul><li>Es fundamental mantener un registro detallado de todas las interacciones y ajustes realizados.</li><li>En caso de que el cliente prefiera un reembolso directo en lugar de la aplicación al próximo recibo, se deben seguir los procedimientos específicos para reembolsos.</li><li>Monitorear la correcta aplicación del saldo a favor en el siguiente ciclo de facturación para asegurar la conformidad.</li></ul>', 
 'Generado con IA desde documentación', 'BORRADOR', 'MANUAL'),

(0, 10, 1, '2025-12-04 07:06:34.911119', 
 1, NULL, 
 '<h2>📋 Problema</h2><p>El cliente experimentó una reducción significativa en la velocidad de su servicio de internet de fibra óptica, pasando de un plan contratado de 200 Mbps a velocidades de entre 15-20 Mbps. El problema persistió durante 3 días.</p><h2>🔍 Causa</h2><p>El diagnóstico remoto inicial reveló una señal óptica degradada (estado PON en amarillo). La visita técnica posterior confirmó que la causa era una micro-fractura en el cable de fibra óptica, localizada cerca de la roseta del cliente.</p><h2>✅ Pasos para Solucionar</h2><ol><li><strong>Paso 1:</strong> Se realizó un diagnóstico remoto inicial, identificando una señal óptica degradada (PON en amarillo) como indicio del problema.</li><li><strong>Paso 2:</strong> Se coordinó y ejecutó una visita técnica al domicilio del cliente para una inspección in situ.</li><li><strong>Paso 3:</strong> El técnico localizó y reemplazó el tramo de cable de fibra óptica afectado por la micro-fractura cerca de la roseta.</li><li><strong>Paso 4:</strong> Se verificó la restauración de la señal óptica (PON en verde) y se confirmó la velocidad de servicio (195 Mbps) mediante una prueba directa con cable Ethernet.</li></ol><h2>⚠️ Notas</h2><ul><li>Se instruyó al cliente sobre la importancia de realizar pruebas de velocidad utilizando una conexión por cable Ethernet en lugar de Wi-Fi para obtener resultados precisos.</li></ul>', 
 'Generado con IA desde documentación', 'BORRADOR', 'MANUAL'),

(0, 11, 1, '2025-12-04 07:11:34.534790', 
 1, NULL, 
 '<h2>📋 Problema</h2><p>El cliente reporta que no puede conectarse a la red 4G después de cambiar de equipo. El dispositivo muestra ''Sin servicio'' aunque tiene señal. Ya intentó reiniciar el equipo sin éxito.</p><h2>🔍 Causa</h2><p>Se verificó que el APN (Access Point Name) no estaba configurado correctamente en el nuevo dispositivo del cliente.</p><h2>✅ Pasos para Solucionar</h2><ol><li><strong>Paso 1:</strong> Acceder a la configuración de Redes Móviles o Conexiones en el dispositivo del cliente.</li><li><strong>Paso 2:</strong> Buscar la opción ''Nombres de Puntos de Acceso'' (APN).</li><li><strong>Paso 3:</strong> Crear un nuevo APN o editar el existente con los siguientes datos: APN: internet.empresa.pe, Usuario: (vacío), Contraseña: (vacío).</li><li><strong>Paso 4:</strong> Guardar la configuración del APN y reiniciar el equipo para aplicar los cambios.</li></ol><h2>⚠️ Notas</h2><ul><li>En algunos equipos, el APN no se configura automáticamente al insertar la tarjeta SIM, requiriendo una configuración manual.</li><li>Es importante verificar que el cliente haya guardado los cambios y reiniciado el dispositivo.</li></ul>', 
 'Generado con IA desde documentación', 'BORRADOR', 'MANUAL'),

(0, 12, 1, '2025-12-04 07:16:26.605062', 
 1, NULL, 
 '<h2>📋 Problema</h2><p>El cliente reporta que no puede conectarse a la red 4G después de cambiar de equipo. El dispositivo muestra ''Sin servicio'' aunque tiene señal. Ya intentó reiniciar el equipo sin éxito.</p><h2>🔍 Causa</h2><p>Se verificó que el APN (Access Point Name) no estaba configurado correctamente en el nuevo dispositivo del cliente, lo que impedía la conexión a la red de datos 4G.</p><h2>✅ Pasos para Solucionar</h2><ol><li><strong>Paso 1:</strong> Acceder a la configuración del dispositivo móvil. Generalmente se encuentra en ''Ajustes'' o ''Configuración''.</li><li><strong>Paso 2:</strong> Navegar a ''Redes Móviles'' o ''Conexiones'' y luego buscar ''Nombres de Puntos de Acceso'' (APN).</li><li><strong>Paso 3:</strong> Crear un nuevo APN o editar el existente con los siguientes datos:<ul><li><strong>APN:</strong> internet.empresa.pe</li><li><strong>Usuario:</strong> (dejar vacío)</li><li><strong>Contraseña:</strong> (dejar vacío)</li></ul></li><li><strong>Paso 4:</strong> Guardar la configuración del APN y seleccionar el APN recién configurado. Luego, reiniciar el equipo para aplicar los cambios.</li></ol><h2>⚠️ Notas</h2><ul><li>En algunos equipos, la configuración del APN no se realiza automáticamente al insertar la tarjeta SIM, requiriendo una configuración manual.</li><li>Es importante verificar que los datos del APN sean exactamente los proporcionados por la empresa.</li></ul>', 
 'Generado con IA desde documentación', 'BORRADOR', 'MANUAL'),

(0, 13, 1, '2025-12-04 16:36:35.299200', 
 1, NULL, 
 'i', 'o', 'PROPUESTO', 'MANUAL');


-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Los valores de id_creador (1, 2, 3, 4, 5) deben existir en la tabla 'empleados'
--    como id_empleado. Ajusta estos valores según los empleados que tengas.
--
-- 2. Si usas AUTO_INCREMENT, puedes omitir los campos id_articulo e id_version
--    y dejar que la base de datos los genere automáticamente.
--
-- 3. Para ejecutar sin especificar IDs (recomendado):
--    - Elimina 'id_articulo,' de los INSERT de articulos
--    - Elimina 'id_version,' de los INSERT de articulo_versiones
--    - Ajusta las referencias de id_articulo en articulo_versiones
--
-- 4. Si tienes tickets existentes y quieres asociar versiones a tickets,
--    cambia los valores NULL de id_ticket por IDs de tickets existentes.
-- ============================================================================
