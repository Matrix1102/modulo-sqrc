-- ========================================
-- Script de Inicialización de Base de Datos
-- Sistema SQRC - Módulo Vista 360 y Tickets
-- Base de datos: sqrc_db
-- ========================================

-- Configuración de caracteres para evitar problemas con ñ, á, é, í, ó, ú
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Eliminar base de datos si existe y crear nueva
DROP DATABASE IF EXISTS sqrc_db;
CREATE DATABASE sqrc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sqrc_db;

-- Asegurar encoding en la sesión actual
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- TABLA: clientes
-- ========================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(9),
    fecha_registro DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_dni (dni),
    INDEX idx_nombres_apellidos (nombres, apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: empleados
-- ========================================
CREATE TABLE empleados (
    id_empleado BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    correo VARCHAR(255),
    telefono VARCHAR(50),
    puesto VARCHAR(100),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: motivos
-- ========================================
CREATE TABLE motivos (
    id_motivo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: tickets (Tabla padre con herencia JOINED)
-- ========================================
CREATE TABLE tickets (
    id_ticket BIGINT AUTO_INCREMENT PRIMARY KEY,
    asunto VARCHAR(100),
    motivo_id BIGINT,
    descripcion VARCHAR(300),
    estado ENUM('ABIERTO', 'ESCALADO', 'DERIVADO', 'AUDITORIA', 'CERRADO') NOT NULL DEFAULT 'ABIERTO',
    fecha_creacion DATETIME NOT NULL,
    fecha_cierre DATETIME,
    origen ENUM('WEB', 'EMAIL', 'TELEFONO', 'CHAT', 'API', 'INTERNO', 'APP', 'OTRO') NOT NULL,
    cliente_id INT,
    tipo_ticket ENUM('CONSULTA', 'QUEJA', 'RECLAMO', 'SOLICITUD') NOT NULL,
    id_constancia INT,
    FOREIGN KEY (motivo_id) REFERENCES motivos(id_motivo) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_cliente (cliente_id),
    INDEX idx_tipo (tipo_ticket)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLAS DE HERENCIA: Subtipos de Tickets
-- ========================================

-- Tabla: consultas (JOINED con tickets)
CREATE TABLE consultas (
    id_ticket BIGINT PRIMARY KEY,
    tema VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: quejas (JOINED con tickets)
CREATE TABLE quejas (
    id_ticket BIGINT PRIMARY KEY,
    impacto TEXT,
    area_involucrada VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: reclamos (JOINED con tickets)
CREATE TABLE reclamos (
    id_ticket BIGINT PRIMARY KEY,
    motivo_reclamo TEXT,
    fecha_limite_respuesta DATE,
    fecha_limite_resolucion DATE,
    resultado VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: solicitudes (JOINED con tickets)
CREATE TABLE solicitudes (
    id_ticket BIGINT PRIMARY KEY,
    tipo_solicitud VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: asignaciones
-- ========================================
CREATE TABLE asignaciones (
    id_asignacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    empleado_id BIGINT,
    area_id BIGINT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    asignacion_padre BIGINT,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado) ON DELETE SET NULL,
    FOREIGN KEY (asignacion_padre) REFERENCES asignaciones(id_asignacion) ON DELETE SET NULL,
    INDEX idx_ticket (ticket_id),
    INDEX idx_empleado (empleado_id),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: documentacion
-- ========================================
CREATE TABLE documentacion (
    id_documentacion INT AUTO_INCREMENT PRIMARY KEY,
    problema TEXT,
    id_articuloKB INT,
    solucion TEXT,
    empleado_id BIGINT,
    id_asignacion BIGINT,
    fechaCreacion DATETIME NOT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado) ON DELETE SET NULL,
    FOREIGN KEY (id_asignacion) REFERENCES asignaciones(id_asignacion) ON DELETE CASCADE,
    INDEX idx_articulo_kb (id_articuloKB)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: plantillas_encuesta
-- ========================================
CREATE TABLE plantillas_encuesta (
    id_plantilla BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME NOT NULL,
    fecha_ultima_modificacion DATETIME,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: preguntas (con herencia SINGLE_TABLE)
-- ========================================
CREATE TABLE preguntas (
    id_pregunta BIGINT AUTO_INCREMENT PRIMARY KEY,
    dtype VARCHAR(31) NOT NULL, -- Discriminator para herencia
    plantilla_id BIGINT NOT NULL,
    texto_pregunta VARCHAR(500) NOT NULL,
    orden INT NOT NULL,
    obligatoria BOOLEAN NOT NULL DEFAULT FALSE,
    -- Campos específicos de PreguntaBooleana
    etiqueta_verdadero VARCHAR(50),
    etiqueta_falso VARCHAR(50),
    -- Campos específicos de PreguntaTexto
    max_caracteres INT,
    tipo_texto VARCHAR(50), -- CORTO, LARGO, EMAIL, etc.
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_encuesta(id_plantilla) ON DELETE CASCADE,
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: opciones_pregunta
-- ========================================
CREATE TABLE opciones_pregunta (
    id_opcion BIGINT AUTO_INCREMENT PRIMARY KEY,
    pregunta_id BIGINT NOT NULL,
    texto_opcion VARCHAR(255) NOT NULL,
    orden INT NOT NULL,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE,
    INDEX idx_pregunta (pregunta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: encuestas_ejecucion
-- ========================================
CREATE TABLE encuestas_ejecucion (
    id_encuesta BIGINT AUTO_INCREMENT PRIMARY KEY,
    plantilla_id BIGINT NOT NULL,
    ticket_id BIGINT,
    cliente_id INT,
    fecha_envio DATETIME NOT NULL,
    fecha_completado DATETIME,
    estado ENUM('PENDIENTE', 'COMPLETADA', 'EXPIRADA') NOT NULL DEFAULT 'PENDIENTE',
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_encuesta(id_plantilla) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id_ticket) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_fecha_envio (fecha_envio),
    INDEX idx_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: respuestas_encuesta
-- ========================================
CREATE TABLE respuestas_encuesta (
    id_respuesta_encuesta BIGINT AUTO_INCREMENT PRIMARY KEY,
    encuesta_id BIGINT NOT NULL,
    fecha_respuesta DATETIME NOT NULL,
    FOREIGN KEY (encuesta_id) REFERENCES encuestas_ejecucion(id_encuesta) ON DELETE CASCADE,
    INDEX idx_encuesta (encuesta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: respuestas_pregunta
-- ========================================
CREATE TABLE respuestas_pregunta (
    id_respuesta_pregunta BIGINT AUTO_INCREMENT PRIMARY KEY,
    respuesta_encuesta_id BIGINT NOT NULL,
    pregunta_id BIGINT NOT NULL,
    opcion_id BIGINT,
    texto_respuesta TEXT,
    FOREIGN KEY (respuesta_encuesta_id) REFERENCES respuestas_encuesta(id_respuesta_encuesta) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE,
    FOREIGN KEY (opcion_id) REFERENCES opciones_pregunta(id_opcion) ON DELETE SET NULL,
    INDEX idx_respuesta_encuesta (respuesta_encuesta_id),
    INDEX idx_pregunta (pregunta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLAS KPI (Reportes)
-- ========================================

CREATE TABLE kpi_resumen_diario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tickets_abiertos INT NOT NULL DEFAULT 0,
    tickets_cerrados INT NOT NULL DEFAULT 0,
    tiempo_promedio_resolucion_horas DECIMAL(10,2),
    sla_cumplido_porcentaje DECIMAL(5,2),
    UNIQUE KEY uk_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kpi_tiempos_resolucion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo_ticket ENUM('CONSULTA', 'QUEJA', 'RECLAMO', 'SOLICITUD') NOT NULL,
    tiempo_promedio_horas DECIMAL(10,2),
    tiempo_minimo_horas DECIMAL(10,2),
    tiempo_maximo_horas DECIMAL(10,2),
    cantidad_tickets INT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_fecha_tipo (fecha, tipo_ticket)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kpi_rendimiento_agente_diario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    empleado_id BIGINT NOT NULL,
    tickets_atendidos INT NOT NULL DEFAULT 0,
    tickets_resueltos INT NOT NULL DEFAULT 0,
    tiempo_promedio_atencion_horas DECIMAL(10,2),
    calificacion_promedio DECIMAL(3,2),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    UNIQUE KEY uk_fecha_empleado (fecha, empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kpi_motivos_frecuentes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo_id BIGINT NOT NULL,
    cantidad_tickets INT NOT NULL DEFAULT 0,
    porcentaje DECIMAL(5,2),
    FOREIGN KEY (motivo_id) REFERENCES motivos(id_motivo) ON DELETE CASCADE,
    INDEX idx_fecha_rango (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kpi_dashboard_encuestas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    encuestas_enviadas INT NOT NULL DEFAULT 0,
    encuestas_respondidas INT NOT NULL DEFAULT 0,
    tasa_respuesta DECIMAL(5,2),
    calificacion_promedio DECIMAL(3,2),
    UNIQUE KEY uk_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERCIÓN DE DATOS DE PRUEBA
-- ========================================

-- Insertar Clientes (20 clientes)
INSERT INTO clientes (dni, nombres, apellidos, fecha_nacimiento, correo, telefono, celular, fecha_registro, activo) VALUES
('12345678', 'Juan Carlos', 'Perez Garcia', '1985-03-15', 'juan.perez@email.com', '014567890', '987654321', '2023-01-10', TRUE),
('23456789', 'Maria Elena', 'Lopez Martinez', '1990-07-22', 'maria.lopez@email.com', '014567891', '987654322', '2023-02-15', TRUE),
('34567890', 'Pedro Antonio', 'Ramirez Silva', '1988-11-30', 'pedro.ramirez@email.com', '014567892', '987654323', '2023-03-20', TRUE),
('45678901', 'Ana Sofia', 'Torres Vega', '1995-05-10', 'ana.torres@email.com', '014567893', '987654324', '2023-04-25', TRUE),
('56789012', 'Luis Miguel', 'Fernandez Cruz', '1982-09-18', 'luis.fernandez@email.com', '014567894', '987654325', '2023-05-30', TRUE),
('67890123', 'Carmen Rosa', 'Morales Diaz', '1992-12-05', 'carmen.morales@email.com', NULL, '987654326', '2023-06-15', TRUE),
('78901234', 'Roberto Carlos', 'Sanchez Rojas', '1987-02-28', 'roberto.sanchez@email.com', '014567896', '987654327', '2023-07-10', TRUE),
('89012345', 'Gabriela Patricia', 'Vargas Mendoza', '1993-08-14', 'gabriela.vargas@email.com', NULL, '987654328', '2023-08-05', TRUE),
('90123456', 'Ricardo Andres', 'Castillo Ruiz', '1984-06-20', 'ricardo.castillo@email.com', '014567899', '987654329', '2023-08-20', TRUE),
('01234567', 'Lucia Fernanda', 'Ortiz Paredes', '1991-01-12', 'lucia.ortiz@email.com', '014568000', '987654330', '2023-09-01', TRUE),
('11223344', 'Diego Alejandro', 'Herrera Campos', '1989-04-08', 'diego.herrera@email.com', '014568001', '987654331', '2023-09-15', TRUE),
('22334455', 'Valentina Isabel', 'Quispe Mamani', '1996-10-25', 'valentina.quispe@email.com', NULL, '987654332', '2023-10-01', TRUE),
('33445566', 'Andres Felipe', 'Chavez Luna', '1983-12-18', 'andres.chavez@email.com', '014568003', '987654333', '2023-10-10', TRUE),
('44556677', 'Camila Alejandra', 'Vasquez Delgado', '1994-03-30', 'camila.vasquez@email.com', '014568004', '987654334', '2023-10-25', TRUE),
('55667788', 'Sebastian Mateo', 'Ramos Flores', '1986-07-14', 'sebastian.ramos@email.com', NULL, '987654335', '2023-11-01', TRUE),
('66778899', 'Natalia Andrea', 'Espinoza Guzman', '1997-09-05', 'natalia.espinoza@email.com', '014568006', '987654336', '2023-11-10', TRUE),
('77889900', 'Francisco Javier', 'Mendez Palacios', '1980-11-22', 'francisco.mendez@email.com', '014568007', '987654337', '2023-11-15', TRUE),
('88990011', 'Isabella Carolina', 'Rojas Aguirre', '1998-02-17', 'isabella.rojas@email.com', NULL, '987654338', '2023-11-20', TRUE),
('99001122', 'Martin Eduardo', 'Silva Cordova', '1981-08-09', 'martin.silva@email.com', '014568009', '987654339', '2023-11-25', TRUE),
('10203040', 'Paula Daniela', 'Gutierrez Rivas', '1999-05-28', 'paula.gutierrez@email.com', '014568010', '987654340', '2023-12-01', TRUE);

-- Insertar Empleados (15 empleados)
INSERT INTO empleados (nombre, correo, telefono, puesto) VALUES
('Carlos Mendez', 'carlos.mendez@empresa.com', '987111111', 'Agente de Soporte'),
('Laura Gutierrez', 'laura.gutierrez@empresa.com', '987222222', 'Agente de Soporte'),
('Miguel Angel Ramos', 'miguel.ramos@empresa.com', '987333333', 'Especialista Tecnico'),
('Patricia Flores', 'patricia.flores@empresa.com', '987444444', 'Supervisor'),
('Jorge Luis Castro', 'jorge.castro@empresa.com', '987555555', 'Agente Senior'),
('Daniela Reyes', 'daniela.reyes@empresa.com', '987666666', 'Coordinadora'),
('Fernando Ruiz', 'fernando.ruiz@empresa.com', '987777777', 'Analista de Calidad'),
('Sofia Campos', 'sofia.campos@empresa.com', '987888888', 'Agente de Soporte'),
('Alejandro Vega', 'alejandro.vega@empresa.com', '987999999', 'Especialista Tecnico'),
('Rosa Maria Paredes', 'rosa.paredes@empresa.com', '987101010', 'Agente de Soporte'),
('Carlos Alberto Rios', 'carlos.rios@empresa.com', '987111112', 'Supervisor'),
('Ana Lucia Medina', 'ana.medina@empresa.com', '987121212', 'Agente Senior'),
('Pedro Pablo Nunez', 'pedro.nunez@empresa.com', '987131313', 'Coordinador'),
('Maria Jose Carrillo', 'maria.carrillo@empresa.com', '987141414', 'Analista de Calidad'),
('Juan Diego Salazar', 'juan.salazar@empresa.com', '987151515', 'Agente de Soporte');

-- Insertar Motivos (20 motivos)
INSERT INTO motivos (nombre) VALUES
('Consulta sobre facturacion'),
('Problema con el servicio de internet'),
('Solicitud de cambio de plan'),
('Queja por atencion al cliente'),
('Reclamo por cobro indebido'),
('Consulta sobre instalacion'),
('Problema tecnico con equipo'),
('Solicitud de cancelacion de servicio'),
('Reclamo por falla en el servicio'),
('Consulta sobre promociones'),
('Queja por demora en la atencion'),
('Solicitud de reembolso'),
('Problema con la senal'),
('Consulta sobre cobertura'),
('Reclamo por danos en instalacion'),
('Solicitud de traslado de servicio'),
('Consulta sobre contrato'),
('Queja por informacion incorrecta'),
('Reclamo por servicio no prestado'),
('Solicitud de factura electronica');

-- Insertar Tickets - CONSULTAS (10 consultas)
INSERT INTO tickets (asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket) VALUES
('Consulta sobre facturacion del mes de noviembre', 1, 'Cliente desea conocer el detalle de los cargos en su factura del mes pasado', 'CERRADO', '2024-11-15 09:30:00', '2024-11-15 14:20:00', 'TELEFONO', 1, 'CONSULTA'),
('Informacion sobre instalacion de nuevo servicio', 6, 'Cliente requiere informacion sobre el proceso de instalacion', 'ABIERTO', '2024-12-01 10:15:00', NULL, 'WEB', 3, 'CONSULTA'),
('Consulta sobre promociones vigentes', 10, 'Cliente consulta sobre planes promocionales disponibles', 'CERRADO', '2024-11-28 16:45:00', '2024-11-28 17:30:00', 'CHAT', 2, 'CONSULTA'),
('Consulta sobre cobertura en zona rural', 14, 'Cliente necesita saber si hay cobertura en su nueva direccion', 'ABIERTO', '2024-12-01 08:00:00', NULL, 'EMAIL', 9, 'CONSULTA'),
('Consulta sobre contrato vigente', 17, 'Cliente solicita copia de su contrato actual', 'CERRADO', '2024-11-20 11:30:00', '2024-11-20 15:00:00', 'WEB', 10, 'CONSULTA'),
('Consulta sobre velocidad de internet', 2, 'Cliente pregunta por que su velocidad es menor a la contratada', 'ESCALADO', '2024-11-29 14:00:00', NULL, 'TELEFONO', 11, 'CONSULTA'),
('Consulta sobre factura electronica', 20, 'Cliente necesita configurar su facturacion electronica', 'ABIERTO', '2024-12-01 09:45:00', NULL, 'CHAT', 12, 'CONSULTA'),
('Consulta sobre horarios de atencion', 6, 'Cliente consulta horarios de oficinas para tramites presenciales', 'CERRADO', '2024-11-25 10:00:00', '2024-11-25 10:30:00', 'TELEFONO', 13, 'CONSULTA'),
('Consulta sobre requisitos para cambio de titular', 17, 'Cliente desea transferir el servicio a otra persona', 'DERIVADO', '2024-11-27 16:20:00', NULL, 'EMAIL', 14, 'CONSULTA'),
('Consulta sobre planes empresariales', 10, 'Cliente PYME consulta opciones de planes corporativos', 'ABIERTO', '2024-12-01 11:00:00', NULL, 'WEB', 15, 'CONSULTA');

INSERT INTO consultas (id_ticket, tema) VALUES
(1, 'Facturacion y Cargos'),
(2, 'Instalaciones'),
(3, 'Promociones y Ofertas'),
(4, 'Cobertura de Servicio'),
(5, 'Contratos'),
(6, 'Velocidad de Internet'),
(7, 'Facturacion Electronica'),
(8, 'Atencion al Cliente'),
(9, 'Cambio de Titularidad'),
(10, 'Planes Empresariales');

-- Insertar Tickets - QUEJAS (8 quejas)
INSERT INTO tickets (asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket) VALUES
('Queja por demora en atencion telefonica', 11, 'Cliente espero mas de 30 minutos para ser atendido', 'ESCALADO', '2024-11-29 11:20:00', NULL, 'TELEFONO', 4, 'QUEJA'),
('Queja por mala atencion en oficina', 4, 'Cliente reporta trato inadecuado por parte del personal', 'DERIVADO', '2024-11-27 14:00:00', NULL, 'EMAIL', 5, 'QUEJA'),
('Queja por informacion erronea', 18, 'Le indicaron precios incorrectos al momento de contratar', 'ABIERTO', '2024-11-30 09:15:00', NULL, 'WEB', 16, 'QUEJA'),
('Queja por tecnico que no llego', 6, 'El tecnico no se presento a la cita programada', 'ESCALADO', '2024-11-28 18:00:00', NULL, 'APP', 17, 'QUEJA'),
('Queja por cambio de plan sin autorizacion', 3, 'Le cambiaron el plan sin su consentimiento', 'AUDITORIA', '2024-11-26 10:30:00', NULL, 'TELEFONO', 18, 'QUEJA'),
('Queja por cobros recurrentes incorrectos', 5, 'Lleva 3 meses con cobros adicionales no justificados', 'DERIVADO', '2024-11-25 14:45:00', NULL, 'EMAIL', 19, 'QUEJA'),
('Queja por tiempo de espera en chat', 11, 'Tuvo que esperar 45 minutos en el chat online', 'CERRADO', '2024-11-22 16:00:00', '2024-11-23 10:00:00', 'CHAT', 20, 'QUEJA'),
('Queja por actitud del personal tecnico', 4, 'El tecnico fue grosero durante la visita', 'ABIERTO', '2024-12-01 07:30:00', NULL, 'TELEFONO', 1, 'QUEJA');

INSERT INTO quejas (id_ticket, impacto, area_involucrada) VALUES
(11, 'Cliente insatisfecho, posible cancelacion del servicio', 'Atencion al Cliente'),
(12, 'Experiencia negativa que afecta la imagen de la empresa', 'Oficina Centro Lima'),
(13, 'Cliente siente que fue enganado, demanda compensacion', 'Ventas'),
(14, 'Perdida de dia laboral del cliente, solicita compensacion', 'Servicio Tecnico'),
(15, 'Cliente amenaza con denunciar ante INDECOPI', 'Facturacion'),
(16, 'Cliente ha publicado quejas en redes sociales', 'Facturacion'),
(17, 'Cliente molesto pero dispuesto a continuar con el servicio', 'Atencion Digital'),
(18, 'Cliente muy molesto, exige cambio de tecnico asignado', 'Servicio Tecnico');

-- Insertar Tickets - RECLAMOS (10 reclamos)
INSERT INTO tickets (asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket) VALUES
('Reclamo por cobro indebido en factura', 5, 'Se cobraron servicios no contratados', 'AUDITORIA', '2024-11-25 08:00:00', NULL, 'WEB', 6, 'RECLAMO'),
('Reclamo por danos en instalacion', 15, 'Durante la instalacion se dano la pared del domicilio', 'ABIERTO', '2024-11-30 15:30:00', NULL, 'TELEFONO', 7, 'RECLAMO'),
('Reclamo por falla continua del servicio', 9, 'Servicio de internet con caidas constantes hace 1 semana', 'ESCALADO', '2024-11-26 10:00:00', NULL, 'APP', 8, 'RECLAMO'),
('Reclamo por servicio no activado', 19, 'Pago la instalacion pero nunca activaron el servicio', 'ABIERTO', '2024-12-01 08:30:00', NULL, 'TELEFONO', 2, 'RECLAMO'),
('Reclamo por velocidad inferior a la contratada', 2, 'Contrato 100 Mbps pero solo recibe 20 Mbps', 'ESCALADO', '2024-11-28 09:00:00', NULL, 'WEB', 3, 'RECLAMO'),
('Reclamo por cobro de equipo devuelto', 5, 'Le cobran alquiler de equipo que ya devolvio', 'DERIVADO', '2024-11-27 11:00:00', NULL, 'EMAIL', 4, 'RECLAMO'),
('Reclamo por corte de servicio injustificado', 9, 'Le cortaron el servicio estando al dia en pagos', 'AUDITORIA', '2024-11-24 16:00:00', NULL, 'TELEFONO', 5, 'RECLAMO'),
('Reclamo por promocion no aplicada', 10, 'La promocion ofrecida no se refleja en la factura', 'ABIERTO', '2024-11-30 10:45:00', NULL, 'CHAT', 9, 'RECLAMO'),
('Reclamo por dano a equipo del cliente', 15, 'El tecnico dano el router personal del cliente', 'ESCALADO', '2024-11-29 13:00:00', NULL, 'APP', 10, 'RECLAMO'),
('Reclamo por doble facturacion', 5, 'Le cobraron dos veces el mismo mes', 'CERRADO', '2024-11-20 09:00:00', '2024-11-25 17:00:00', 'WEB', 11, 'RECLAMO');

INSERT INTO reclamos (id_ticket, motivo_reclamo, fecha_limite_respuesta, fecha_limite_resolucion, resultado) VALUES
(19, 'Cobro de S/. 150.00 por servicios no solicitados', '2024-12-05', '2024-12-20', NULL),
(20, 'Dano en pared requiere reparacion estimada en S/. 300.00', '2024-12-07', '2024-12-22', NULL),
(21, 'Interrupciones constantes afectan trabajo remoto del cliente', '2024-12-03', '2024-12-18', NULL),
(22, 'Pago S/. 200.00 por instalacion que nunca se realizo', '2024-12-08', '2024-12-23', NULL),
(23, 'Velocidad real es 80% menor a la contratada', '2024-12-05', '2024-12-20', NULL),
(24, 'Cobro indebido de S/. 50.00 mensuales por 3 meses', '2024-12-04', '2024-12-19', NULL),
(25, 'Corte de servicio causo perdidas al negocio del cliente', '2024-12-01', '2024-12-16', NULL),
(26, 'Promocion de 50% descuento no fue aplicada', '2024-12-07', '2024-12-22', NULL),
(27, 'Router danado valorizado en S/. 180.00', '2024-12-06', '2024-12-21', NULL),
(28, 'Doble cobro de S/. 89.90', '2024-11-27', '2024-12-12', 'FAVORABLE - Devolucion aprobada');

-- Insertar Tickets - SOLICITUDES (10 solicitudes)
INSERT INTO tickets (asunto, motivo_id, descripcion, estado, fecha_creacion, fecha_cierre, origen, cliente_id, tipo_ticket) VALUES
('Solicitud de cambio a plan superior', 3, 'Cliente desea upgrade a plan de 200 Mbps', 'CERRADO', '2024-11-20 09:00:00', '2024-11-22 16:00:00', 'CHAT', 1, 'SOLICITUD'),
('Solicitud de cancelacion de servicio', 8, 'Cliente solicita dar de baja el servicio por mudanza', 'ABIERTO', '2024-11-30 13:00:00', NULL, 'EMAIL', 2, 'SOLICITUD'),
('Solicitud de reembolso por dias no utilizados', 12, 'Cliente solicita devolucion proporcional por cancelacion anticipada', 'DERIVADO', '2024-11-28 11:30:00', NULL, 'WEB', 3, 'SOLICITUD'),
('Solicitud de traslado de servicio', 16, 'Cliente se muda y quiere llevar el servicio a nueva direccion', 'ABIERTO', '2024-12-01 10:00:00', NULL, 'TELEFONO', 12, 'SOLICITUD'),
('Solicitud de cambio de velocidad', 3, 'Cliente desea reducir su plan para pagar menos', 'CERRADO', '2024-11-18 14:00:00', '2024-11-19 11:00:00', 'WEB', 13, 'SOLICITUD'),
('Solicitud de segunda linea', 3, 'Cliente quiere contratar una linea adicional', 'ABIERTO', '2024-11-30 16:00:00', NULL, 'CHAT', 14, 'SOLICITUD'),
('Solicitud de cambio de fecha de facturacion', 1, 'Cliente pide cambiar ciclo de facturacion al dia 15', 'CERRADO', '2024-11-22 09:30:00', '2024-11-22 12:00:00', 'APP', 15, 'SOLICITUD'),
('Solicitud de suspension temporal', 8, 'Cliente viajara 2 meses y quiere suspender servicio', 'DERIVADO', '2024-11-27 08:45:00', NULL, 'EMAIL', 16, 'SOLICITUD'),
('Solicitud de factura para deduccion', 20, 'Empresa necesita factura con RUC para deducir gastos', 'ABIERTO', '2024-12-01 11:30:00', NULL, 'WEB', 17, 'SOLICITUD'),
('Solicitud de cambio de titular', 17, 'Hijo asumira la titularidad del servicio', 'ESCALADO', '2024-11-29 15:00:00', NULL, 'TELEFONO', 18, 'SOLICITUD');

INSERT INTO solicitudes (id_ticket, tipo_solicitud) VALUES
(29, 'Cambio de Plan'),
(30, 'Baja de Servicio'),
(31, 'Reembolso'),
(32, 'Traslado de Servicio'),
(33, 'Cambio de Plan'),
(34, 'Linea Adicional'),
(35, 'Cambio Ciclo Facturacion'),
(36, 'Suspension Temporal'),
(37, 'Facturacion Especial'),
(38, 'Cambio de Titular');

-- Insertar Asignaciones (multiples por ticket para mostrar historial)
-- CONSULTAS
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES
(1, 1, 1, '2024-11-15 09:35:00', '2024-11-15 14:20:00', NULL),
(2, 2, 1, '2024-12-01 10:20:00', NULL, NULL),
(3, 8, 1, '2024-11-28 16:50:00', '2024-11-28 17:30:00', NULL),
(4, 10, 1, '2024-12-01 08:05:00', NULL, NULL),
(5, 1, 1, '2024-11-20 11:35:00', '2024-11-20 15:00:00', NULL),
(6, 2, 1, '2024-11-29 14:05:00', '2024-11-29 16:00:00', NULL),
(6, 9, 2, '2024-11-29 16:00:00', NULL, 6),
(7, 15, 1, '2024-12-01 09:50:00', NULL, NULL),
(8, 8, 1, '2024-11-25 10:05:00', '2024-11-25 10:30:00', NULL),
(9, 5, 1, '2024-11-27 16:25:00', '2024-11-28 09:00:00', NULL),
(9, 6, 3, '2024-11-28 09:00:00', NULL, 10),
(10, 12, 1, '2024-12-01 11:05:00', NULL, NULL);

-- QUEJAS
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES
(11, 5, 1, '2024-11-29 11:25:00', '2024-11-29 15:00:00', NULL),
(11, 4, 2, '2024-11-29 15:00:00', NULL, 13),
(12, 3, 1, '2024-11-27 14:05:00', '2024-11-28 09:00:00', NULL),
(12, 6, 3, '2024-11-28 09:00:00', NULL, 15),
(13, 10, 1, '2024-11-30 09:20:00', NULL, NULL),
(14, 3, 2, '2024-11-28 18:05:00', '2024-11-29 10:00:00', NULL),
(14, 11, 2, '2024-11-29 10:00:00', NULL, 18),
(15, 5, 1, '2024-11-26 10:35:00', '2024-11-27 09:00:00', NULL),
(15, 7, 4, '2024-11-27 09:00:00', NULL, 20),
(16, 12, 1, '2024-11-25 14:50:00', '2024-11-26 11:00:00', NULL),
(16, 6, 3, '2024-11-26 11:00:00', NULL, 22),
(17, 8, 1, '2024-11-22 16:05:00', '2024-11-23 10:00:00', NULL),
(18, 15, 1, '2024-12-01 07:35:00', NULL, NULL);

-- RECLAMOS  
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES
(19, 5, 1, '2024-11-25 08:05:00', '2024-11-26 10:00:00', NULL),
(19, 7, 4, '2024-11-26 10:00:00', NULL, 26),
(20, 3, 2, '2024-11-30 15:35:00', NULL, NULL),
(21, 1, 1, '2024-11-26 10:10:00', '2024-11-27 16:00:00', NULL),
(21, 3, 2, '2024-11-27 16:00:00', NULL, 29),
(22, 2, 1, '2024-12-01 08:35:00', NULL, NULL),
(23, 9, 2, '2024-11-28 09:05:00', '2024-11-29 14:00:00', NULL),
(23, 11, 2, '2024-11-29 14:00:00', NULL, 32),
(24, 5, 1, '2024-11-27 11:05:00', '2024-11-28 10:00:00', NULL),
(24, 6, 3, '2024-11-28 10:00:00', NULL, 34),
(25, 12, 1, '2024-11-24 16:05:00', '2024-11-25 09:00:00', NULL),
(25, 7, 4, '2024-11-25 09:00:00', NULL, 36),
(26, 10, 1, '2024-11-30 10:50:00', NULL, NULL),
(27, 3, 2, '2024-11-29 13:05:00', '2024-11-30 09:00:00', NULL),
(27, 4, 2, '2024-11-30 09:00:00', NULL, 39),
(28, 1, 1, '2024-11-20 09:05:00', '2024-11-21 14:00:00', NULL),
(28, 5, 1, '2024-11-21 14:00:00', '2024-11-25 17:00:00', 41);

-- SOLICITUDES
INSERT INTO asignaciones (ticket_id, empleado_id, area_id, fecha_inicio, fecha_fin, asignacion_padre) VALUES
(29, 2, 1, '2024-11-20 09:05:00', '2024-11-22 16:00:00', NULL),
(30, 5, 1, '2024-11-30 13:05:00', NULL, NULL),
(31, 8, 1, '2024-11-28 11:35:00', '2024-11-29 10:00:00', NULL),
(31, 6, 3, '2024-11-29 10:00:00', NULL, 45),
(32, 3, 2, '2024-12-01 10:05:00', NULL, NULL),
(33, 10, 1, '2024-11-18 14:05:00', '2024-11-19 11:00:00', NULL),
(34, 12, 1, '2024-11-30 16:05:00', NULL, NULL),
(35, 15, 1, '2024-11-22 09:35:00', '2024-11-22 12:00:00', NULL),
(36, 5, 1, '2024-11-27 08:50:00', '2024-11-28 09:00:00', NULL),
(36, 6, 3, '2024-11-28 09:00:00', NULL, 51),
(37, 8, 1, '2024-12-01 11:35:00', NULL, NULL),
(38, 2, 1, '2024-11-29 15:05:00', '2024-11-30 10:00:00', NULL),
(38, 4, 2, '2024-11-30 10:00:00', NULL, 53);

-- Insertar Documentacion (KB Articles - mas registros)
INSERT INTO documentacion (problema, id_articuloKB, solucion, empleado_id, id_asignacion, fechaCreacion) VALUES
('Cliente confundido con cargos adicionales en factura', 1001, 'Se explico detalladamente cada cargo. Los cargos corresponden a servicios adicionales contratados.', 1, 1, '2024-11-15 14:15:00'),
('Cliente requiere informacion sobre proceso de instalacion', 1002, 'Se proporciono informacion detallada del proceso y se agendo cita para instalacion.', 2, 2, '2024-12-01 10:25:00'),
('Tiempo de espera excesivo en linea telefonica', 1003, 'Se escalo el caso para revisar procesos de atencion. Se ofrecio disculpas al cliente.', 4, 14, '2024-11-29 16:30:00'),
('Cliente reporta velocidad inferior a la contratada', 1004, 'Se realizo diagnostico remoto y se programo visita tecnica para revision de equipos.', 9, 7, '2024-11-29 17:00:00'),
('Cobro de servicios no contratados', 1005, 'Se verifico en sistema y se confirmo error. Se genero nota de credito por S/. 150.00.', 7, 27, '2024-11-27 11:00:00'),
('Dano en propiedad durante instalacion', 1006, 'Se documento el dano con fotos. Se coordino con area de mantenimiento para reparacion.', 3, 28, '2024-11-30 16:30:00'),
('Servicio con caidas constantes', 1007, 'Se identifico problema en nodo. Se programo mantenimiento correctivo en la zona.', 3, 30, '2024-11-28 10:00:00'),
('Queja por informacion erronea de ventas', 1008, 'Se reviso grabacion de llamada de venta. Se confirmo discrepancia y se escalo a supervision.', 10, 17, '2024-11-30 11:00:00'),
('Tecnico no se presento a cita', 1009, 'Se reprogramo cita con prioridad alta. Se ofrecio descuento del 10% en siguiente factura.', 11, 19, '2024-11-29 12:00:00'),
('Cambio de plan no autorizado', 1010, 'Se restauro plan original. Se genero credito por diferencia cobrada. Caso en auditoria.', 7, 21, '2024-11-28 09:30:00'),
('Doble facturacion del mismo periodo', 1011, 'Se confirmo duplicidad de cobro. Se proceso devolucion y se envio constancia al cliente.', 5, 42, '2024-11-25 16:00:00'),
('Solicitud de upgrade de plan', 1012, 'Se proceso cambio a plan 200 Mbps. Activo desde siguiente ciclo de facturacion.', 2, 43, '2024-11-22 15:00:00');

-- Insertar Plantilla de Encuesta
INSERT INTO plantillas_encuesta (nombre, descripcion, fecha_creacion, fecha_ultima_modificacion, activo) VALUES
('Encuesta de Satisfaccion Post-Atencion', 'Encuesta para medir la satisfaccion del cliente despues de resolver su ticket', '2024-01-15 10:00:00', '2024-11-01 14:30:00', TRUE),
('Encuesta de Calidad de Servicio', 'Evaluacion general de la calidad del servicio recibido', '2024-02-20 11:00:00', NULL, TRUE),
('Encuesta de Instalacion', 'Evaluacion del proceso de instalacion del servicio', '2024-03-10 09:00:00', '2024-10-15 11:00:00', TRUE),
('Encuesta NPS', 'Net Promoter Score - Recomendacion del servicio', '2024-04-05 10:30:00', NULL, TRUE);

-- Insertar Preguntas para Plantilla 1
INSERT INTO preguntas (dtype, plantilla_id, texto_pregunta, orden, obligatoria, etiqueta_verdadero, etiqueta_falso, max_caracteres, tipo_texto) VALUES
('PreguntaRadio', 1, 'Como calificaria la atencion recibida?', 1, TRUE, NULL, NULL, NULL, NULL),
('PreguntaBooleana', 1, 'Su problema fue resuelto satisfactoriamente?', 2, TRUE, 'Si', 'No', NULL, NULL),
('PreguntaTexto', 1, 'Por favor, comparta sus comentarios adicionales', 3, FALSE, NULL, NULL, 500, 'LARGO'),
('PreguntaRadio', 2, 'Cual es su nivel de satisfaccion general?', 1, TRUE, NULL, NULL, NULL, NULL),
('PreguntaBooleana', 2, 'Recomendaria nuestro servicio?', 2, TRUE, 'Si', 'No', NULL, NULL),
('PreguntaTexto', 2, 'Que podemos mejorar?', 3, FALSE, NULL, NULL, 300, 'LARGO'),
('PreguntaRadio', 3, 'Como fue el trato del tecnico?', 1, TRUE, NULL, NULL, NULL, NULL),
('PreguntaBooleana', 3, 'El tecnico llego a tiempo?', 2, TRUE, 'Si', 'No', NULL, NULL),
('PreguntaRadio', 3, 'Como califica la limpieza del trabajo?', 3, TRUE, NULL, NULL, NULL, NULL),
('PreguntaRadio', 4, 'Del 0 al 10, que tan probable es que nos recomiende?', 1, TRUE, NULL, NULL, NULL, NULL);

-- Insertar Opciones para Pregunta Radio
INSERT INTO opciones_pregunta (pregunta_id, texto_opcion, orden) VALUES
(1, 'Excelente', 1),
(1, 'Muy Bueno', 2),
(1, 'Bueno', 3),
(1, 'Regular', 4),
(1, 'Malo', 5),
(4, 'Muy Satisfecho', 1),
(4, 'Satisfecho', 2),
(4, 'Neutral', 3),
(4, 'Insatisfecho', 4),
(4, 'Muy Insatisfecho', 5),
(7, 'Excelente', 1),
(7, 'Bueno', 2),
(7, 'Regular', 3),
(7, 'Malo', 4),
(9, 'Excelente', 1),
(9, 'Bueno', 2),
(9, 'Regular', 3),
(9, 'Malo', 4),
(10, '10 - Definitivamente si', 1),
(10, '9', 2),
(10, '8', 3),
(10, '7', 4),
(10, '6', 5),
(10, '5', 6),
(10, '4', 7),
(10, '3', 8),
(10, '2', 9),
(10, '1', 10),
(10, '0 - Definitivamente no', 11);

-- Insertar Encuestas Ejecutadas (mas encuestas)
INSERT INTO encuestas_ejecucion (plantilla_id, ticket_id, cliente_id, fecha_envio, fecha_completado, estado) VALUES
(1, 1, 1, '2024-11-15 14:30:00', '2024-11-15 18:20:00', 'COMPLETADA'),
(1, 3, 2, '2024-11-28 17:35:00', '2024-11-29 09:15:00', 'COMPLETADA'),
(1, 29, 1, '2024-11-22 16:10:00', '2024-11-23 10:00:00', 'COMPLETADA'),
(2, 5, 10, '2024-11-20 15:05:00', '2024-11-21 08:30:00', 'COMPLETADA'),
(1, 8, 13, '2024-11-25 10:35:00', NULL, 'PENDIENTE'),
(2, 17, 20, '2024-11-23 10:05:00', '2024-11-24 14:20:00', 'COMPLETADA'),
(1, 28, 11, '2024-11-25 17:05:00', '2024-11-26 09:00:00', 'COMPLETADA'),
(3, 2, 3, '2024-12-01 10:30:00', NULL, 'PENDIENTE'),
(4, 33, 13, '2024-11-19 11:05:00', '2024-11-19 16:30:00', 'COMPLETADA'),
(1, 7, 12, '2024-12-01 10:00:00', NULL, 'PENDIENTE'),
(2, 35, 15, '2024-11-22 12:05:00', NULL, 'EXPIRADA'),
(1, 10, 15, '2024-12-01 11:30:00', NULL, 'PENDIENTE');

-- Insertar Respuestas de Encuesta
INSERT INTO respuestas_encuesta (encuesta_id, fecha_respuesta) VALUES
(1, '2024-11-15 18:20:00'),
(2, '2024-11-29 09:15:00'),
(3, '2024-11-23 10:00:00'),
(4, '2024-11-21 08:30:00'),
(6, '2024-11-24 14:20:00'),
(7, '2024-11-26 09:00:00'),
(9, '2024-11-19 16:30:00');

-- Insertar Respuestas a Preguntas
INSERT INTO respuestas_pregunta (respuesta_encuesta_id, pregunta_id, opcion_id, texto_respuesta) VALUES
(1, 1, 2, NULL),
(1, 2, NULL, 'true'),
(1, 3, NULL, 'Excelente servicio, muy rapido y profesional'),
(2, 1, 1, NULL),
(2, 2, NULL, 'true'),
(2, 3, NULL, 'Muy satisfecho con la atencion en el chat'),
(3, 1, 1, NULL),
(3, 2, NULL, 'true'),
(3, 3, NULL, 'Todo perfecto, gracias por la rapidez'),
(4, 4, 6, NULL),
(4, 5, NULL, 'true'),
(4, 6, NULL, 'Podrian reducir los tiempos de espera telefonico'),
(5, 4, 7, NULL),
(5, 5, NULL, 'true'),
(5, 6, NULL, 'El servicio de chat es muy eficiente'),
(6, 1, 2, NULL),
(6, 2, NULL, 'true'),
(6, 3, NULL, 'Solucionaron mi problema de facturacion rapidamente'),
(7, 10, 19, NULL);

-- Insertar Datos KPI de ejemplo (datos expandidos)
INSERT INTO kpi_resumen_diario (fecha, tickets_abiertos, tickets_cerrados, tiempo_promedio_resolucion_horas, sla_cumplido_porcentaje) VALUES
('2024-11-01', 3, 2, 3.8, 100.0),
('2024-11-02', 4, 3, 4.2, 95.0),
('2024-11-03', 2, 2, 3.5, 100.0),
('2024-11-04', 5, 4, 4.8, 92.0),
('2024-11-05', 6, 3, 5.2, 88.0),
('2024-11-06', 4, 4, 3.9, 100.0),
('2024-11-07', 3, 2, 4.1, 95.0),
('2024-11-08', 5, 5, 3.6, 98.0),
('2024-11-09', 2, 1, 4.5, 90.0),
('2024-11-10', 4, 3, 4.0, 93.0),
('2024-11-11', 6, 4, 5.5, 85.0),
('2024-11-12', 5, 5, 4.3, 96.0),
('2024-11-13', 4, 3, 3.7, 97.0),
('2024-11-14', 3, 3, 3.4, 100.0),
('2024-11-15', 5, 3, 4.5, 95.0),
('2024-11-16', 4, 4, 4.0, 100.0),
('2024-11-17', 3, 2, 4.8, 90.0),
('2024-11-18', 6, 5, 4.2, 94.0),
('2024-11-19', 5, 4, 3.9, 96.0),
('2024-11-20', 7, 4, 5.8, 82.0),
('2024-11-21', 4, 3, 4.1, 93.0),
('2024-11-22', 5, 4, 4.4, 91.0),
('2024-11-23', 3, 2, 3.5, 100.0),
('2024-11-24', 4, 3, 4.0, 95.0),
('2024-11-25', 6, 4, 5.2, 87.0),
('2024-11-26', 5, 5, 4.6, 92.0),
('2024-11-27', 4, 3, 4.3, 94.0),
('2024-11-28', 8, 5, 3.2, 90.0),
('2024-11-29', 6, 4, 5.1, 88.0),
('2024-11-30', 5, 3, 4.7, 91.0),
('2024-12-01', 4, 0, NULL, NULL);

INSERT INTO kpi_tiempos_resolucion (fecha, tipo_ticket, tiempo_promedio_horas, tiempo_minimo_horas, tiempo_maximo_horas, cantidad_tickets) VALUES
('2024-11-15', 'CONSULTA', 4.8, 2.5, 8.0, 3),
('2024-11-15', 'QUEJA', 5.2, 3.0, 7.5, 2),
('2024-11-15', 'RECLAMO', 6.5, 4.0, 10.0, 2),
('2024-11-15', 'SOLICITUD', 3.5, 2.0, 5.0, 3),
('2024-11-22', 'CONSULTA', 4.2, 2.0, 6.5, 4),
('2024-11-22', 'QUEJA', 5.8, 3.5, 8.0, 3),
('2024-11-22', 'RECLAMO', 7.2, 5.0, 12.0, 3),
('2024-11-22', 'SOLICITUD', 3.8, 2.5, 5.5, 2),
('2024-11-28', 'CONSULTA', 4.5, 2.2, 7.0, 5),
('2024-11-28', 'QUEJA', 6.5, 4.0, 10.0, 4),
('2024-11-28', 'RECLAMO', 8.0, 5.5, 14.0, 3),
('2024-11-28', 'SOLICITUD', 3.5, 2.0, 5.0, 4);

INSERT INTO kpi_rendimiento_agente_diario (fecha, empleado_id, tickets_atendidos, tickets_resueltos, tiempo_promedio_atencion_horas, calificacion_promedio) VALUES
('2024-11-15', 1, 5, 4, 4.2, 4.5),
('2024-11-15', 2, 4, 3, 3.8, 4.8),
('2024-11-15', 5, 3, 2, 4.5, 4.2),
('2024-11-22', 1, 6, 5, 4.0, 4.6),
('2024-11-22', 3, 5, 4, 4.3, 4.4),
('2024-11-22', 7, 4, 3, 4.8, 4.3),
('2024-11-28', 2, 6, 5, 3.8, 4.7),
('2024-11-28', 4, 5, 4, 4.2, 4.5),
('2024-11-28', 9, 4, 3, 4.6, 4.4),
('2024-11-29', 5, 4, 3, 5.5, 4.3),
('2024-11-29', 10, 5, 4, 4.0, 4.6),
('2024-11-30', 11, 3, 2, 4.4, 4.5),
('2024-11-30', 12, 4, 3, 4.1, 4.7);

INSERT INTO kpi_motivos_frecuentes (fecha_inicio, fecha_fin, motivo_id, cantidad_tickets, porcentaje) VALUES
('2024-11-01', '2024-11-30', 1, 8, 21.1),
('2024-11-01', '2024-11-30', 2, 6, 15.8),
('2024-11-01', '2024-11-30', 3, 4, 10.5),
('2024-11-01', '2024-11-30', 5, 5, 13.2),
('2024-11-01', '2024-11-30', 7, 3, 7.9),
('2024-11-01', '2024-11-30', 10, 4, 10.5),
('2024-11-01', '2024-11-30', 12, 3, 7.9),
('2024-11-01', '2024-11-30', 15, 3, 7.9),
('2024-11-01', '2024-11-30', 18, 2, 5.3);

INSERT INTO kpi_dashboard_encuestas (fecha, encuestas_enviadas, encuestas_respondidas, tasa_respuesta, calificacion_promedio) VALUES
('2024-11-15', 3, 2, 66.67, 4.5),
('2024-11-19', 2, 1, 50.00, 4.8),
('2024-11-22', 4, 2, 50.00, 4.6),
('2024-11-25', 3, 2, 66.67, 4.4),
('2024-11-28', 3, 2, 66.67, 5.0),
('2024-12-01', 3, 0, 0.00, NULL);

-- ========================================
-- VERIFICACIÓN DE DATOS
-- ========================================

-- Mostrar resumen de datos insertados
SELECT 'Clientes' AS tabla, COUNT(*) AS total FROM clientes
UNION ALL
SELECT 'Empleados', COUNT(*) FROM empleados
UNION ALL
SELECT 'Motivos', COUNT(*) FROM motivos
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Consultas', COUNT(*) FROM consultas
UNION ALL
SELECT 'Quejas', COUNT(*) FROM quejas
UNION ALL
SELECT 'Reclamos', COUNT(*) FROM reclamos
UNION ALL
SELECT 'Solicitudes', COUNT(*) FROM solicitudes
UNION ALL
SELECT 'Asignaciones', COUNT(*) FROM asignaciones
UNION ALL
SELECT 'Documentación', COUNT(*) FROM documentacion
UNION ALL
SELECT 'Plantillas Encuesta', COUNT(*) FROM plantillas_encuesta
UNION ALL
SELECT 'Preguntas', COUNT(*) FROM preguntas
UNION ALL
SELECT 'Opciones Pregunta', COUNT(*) FROM opciones_pregunta
UNION ALL
SELECT 'Encuestas Ejecución', COUNT(*) FROM encuestas_ejecucion
UNION ALL
SELECT 'Respuestas Encuesta', COUNT(*) FROM respuestas_encuesta
UNION ALL
SELECT 'Respuestas Pregunta', COUNT(*) FROM respuestas_pregunta;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

COMMIT;
