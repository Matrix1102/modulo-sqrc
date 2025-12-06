package com.sqrc.module.backendsqrc.encuesta.service;

import com.sqrc.module.backendsqrc.encuesta.dto.*;
import com.sqrc.module.backendsqrc.encuesta.event.EncuestaRespondidaEvent;
import com.sqrc.module.backendsqrc.encuesta.factory.PreguntaFactory;
import com.sqrc.module.backendsqrc.encuesta.model.*;
import com.sqrc.module.backendsqrc.encuesta.repository.*;
import com.sqrc.module.backendsqrc.ticket.model.Agente;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.jpa.domain.Specification; // Importante para el patrón Specification
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.EmailService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PdfService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EncuestaService {

    // Inyección de Dependencias (Patrón DI)
    @Autowired private EncuestaRepository encuestaRepository;
    @Autowired private PlantillaEncuestaRepository plantillaRepository;
    @Autowired private PreguntaRepository preguntaRepository;
    @Autowired private RespuestaEncuestaRepository respuestaEncuestaRepository;
    @Autowired private Map<String, PreguntaFactory> fabricasPreguntas; // Patrón Factory
    @Autowired private ApplicationEventPublisher eventPublisher;       // Patrón Observer
    @Autowired private EmailService emailService;
    @Autowired private PdfService pdfService;
    @Value("${app.test.recipient:}")
    private String testRecipient;
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    @Value("${app.encuesta.resendWindowHours:24}")
    private long resendWindowHours;

    // ==========================================
    // 1. GESTIÓN DE PLANTILLAS (DISEÑO)
    // ==========================================

    @Transactional(readOnly = true)
    public List<PlantillaResponseDTO> listarPlantillas() {
        return plantillaRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlantillaResponseDTO crearPlantilla(PlantillaRequestDTO dto) {
        PlantillaEncuesta plantilla = new PlantillaEncuesta();
        plantilla.setNombre(dto.getNombre());
        plantilla.setDescripcion(dto.getDescripcion());
        plantilla.setVigente(true);
        // Mapear alcance si viene en el DTO
        if (dto.getAlcanceEvaluacion() != null && !dto.getAlcanceEvaluacion().isEmpty()) {
            try {
                plantilla.setAlcanceEvaluacion(com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion.valueOf(dto.getAlcanceEvaluacion().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore invalid value; could alternatively throw bad request
            }
        }
        plantilla.setPreguntas(new ArrayList<>());

        plantilla = plantillaRepository.save(plantilla);

        // Auto-agregar pregunta de calificación si no viene en las preguntas del DTO
        boolean tienePreguntaCalificacion = false;
        if (dto.getPreguntas() != null) {
            tienePreguntaCalificacion = dto.getPreguntas().stream()
                .anyMatch(PreguntaDTO::isEsCalificacion);
        }

        if (dto.getPreguntas() != null) {
            for (PreguntaDTO pDto : dto.getPreguntas()) {
                agregarPreguntaAPlantilla(plantilla.getIdPlantillaEncuesta(), pDto);
            }
        }

        // Si no hay pregunta de calificación, agregar una automáticamente
        if (!tienePreguntaCalificacion) {
            agregarPreguntaCalificacionAutomatica(plantilla);
        }

        // Recargar plantilla para obtener todas las preguntas
        plantilla = plantillaRepository.findById(plantilla.getIdPlantillaEncuesta()).orElse(plantilla);
        
        return convertirADTO(plantilla);
    }

    /**
     * Agrega automáticamente una pregunta de calificación (1-5) a la plantilla.
     */
    private void agregarPreguntaCalificacionAutomatica(PlantillaEncuesta plantilla) {
        PreguntaDTO calificacionDto = PreguntaDTO.builder()
            .texto("¿Cómo calificaría su experiencia general? (1-5)")
            .tipo("RADIO")
            .obligatoria(true)
            .esCalificacion(true)
            .orden(999) // Se coloca al final
            .opciones(List.of("1 - Muy malo", "2 - Malo", "3 - Regular", "4 - Bueno", "5 - Excelente"))
            .build();
        
        agregarPreguntaAPlantilla(plantilla.getIdPlantillaEncuesta(), calificacionDto);
        log.info("Pregunta de calificación agregada automáticamente a plantilla {}", plantilla.getIdPlantillaEncuesta());
    }

    @Transactional(readOnly = true)
    public PlantillaResponseDTO obtenerPlantillaPorId(String idStr) {
        Long id = Long.parseLong(idStr);
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Plantilla no encontrada"));
        return convertirADTO(plantilla);
    }

    @Transactional
    public PlantillaResponseDTO actualizarPlantilla(String idStr, PlantillaRequestDTO dto) {
        Long id = Long.parseLong(idStr);
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Plantilla no encontrada"));
        // No permitimos actualizar una plantilla que no esté vigente
        if (plantilla.getVigente() != null && !plantilla.getVigente()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "No se puede modificar una plantilla no vigente");
        }

        plantilla.setNombre(dto.getNombre());
        plantilla.setDescripcion(dto.getDescripcion());
        // Mapear alcance si viene en el DTO
        if (dto.getAlcanceEvaluacion() != null && !dto.getAlcanceEvaluacion().isEmpty()) {
            try {
                plantilla.setAlcanceEvaluacion(com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion.valueOf(dto.getAlcanceEvaluacion().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore o podríamos lanzar bad request
            }
        }
        // Nota: Actualizar preguntas profundas requiere lógica de borrado/re-creación que omitimos por brevedad
        
        // Si el DTO incluye preguntas, reemplazamos las preguntas existentes
        if (dto.getPreguntas() != null) {
            // Borrar preguntas actuales asociadas a la plantilla
            if (plantilla.getPreguntas() != null && !plantilla.getPreguntas().isEmpty()) {
                preguntaRepository.deleteAll(plantilla.getPreguntas());
                plantilla.setPreguntas(new java.util.ArrayList<>());
            }

            // Agregar las preguntas definidas en el DTO (usamos la factory para crear subtipo correcto)
            for (PreguntaDTO pDto : dto.getPreguntas()) {
                agregarPreguntaAPlantilla(plantilla.getIdPlantillaEncuesta(), pDto);
            }

            // Recargar plantilla para asegurarnos de devolver el estado actualizado
            plantilla = plantillaRepository.findById(plantilla.getIdPlantillaEncuesta()).orElse(plantilla);
            return convertirADTO(plantilla);
        }

        return convertirADTO(plantillaRepository.save(plantilla));
    }

    @Transactional
    public void desactivarPlantilla(String idStr) {
        Long id = Long.parseLong(idStr);
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Plantilla no encontrada"));
        plantilla.setVigente(false);
        plantillaRepository.save(plantilla);
    }

    @Transactional
    public PlantillaResponseDTO reactivarPlantilla(String idStr) {
        Long id = Long.parseLong(idStr);
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Plantilla no encontrada"));
        plantilla.setVigente(true);
        PlantillaEncuesta saved = plantillaRepository.save(plantilla);
        return convertirADTO(saved);
    }

    // ==========================================
    // 2. CREACIÓN DE ENCUESTAS (EJECUCIÓN)
    // ==========================================

    /**
     * Crea una nueva encuesta asociada a un ticket cerrado.
     * Implementa el patrón Observer: se llama desde TicketGestionService al cerrar un ticket.
     *
     * @param plantillaId ID de la plantilla a usar
     * @param ticket Ticket asociado (puede ser null para encuestas generales)
     * @param agente Agente evaluado (requerido si alcanceEvaluacion = AGENTE)
     * @param cliente Cliente que responderá la encuesta (siempre requerido)
     * @return La encuesta creada
     */
    @Transactional
    public Encuesta crearEncuesta(Long plantillaId, Ticket ticket, Agente agente, ClienteEntity cliente) {
        if (cliente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cliente es obligatorio para crear una encuesta");
        }

        PlantillaEncuesta plantilla = plantillaRepository.findById(plantillaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plantilla no encontrada: " + plantillaId));

        // Validar que la plantilla esté vigente
        if (plantilla.getVigente() == null || !plantilla.getVigente()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La plantilla no está vigente");
        }

        // Validar coherencia: si la plantilla evalúa AGENTE, debe haber un agente
        if (plantilla.getAlcanceEvaluacion() == AlcanceEvaluacion.AGENTE && agente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "La plantilla evalúa al AGENTE, pero no se proporcionó un agente");
        }

        Encuesta encuesta = new Encuesta();
        encuesta.setPlantilla(plantilla);
        encuesta.setTicket(ticket);
        encuesta.setAgente(agente);
        encuesta.setCliente(cliente);
        encuesta.setAlcanceEvaluacion(plantilla.getAlcanceEvaluacion());
        encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
        encuesta.setFechaEnvio(LocalDateTime.now());

        // Calcular fecha de expiración (por defecto 7 días)
        encuesta.setFechaExpiracion(LocalDateTime.now().plusDays(7));

        log.info("Creando encuesta: plantilla={}, ticket={}, agente={}, cliente={}",
            plantillaId, 
            ticket != null ? ticket.getIdTicket() : "null",
            agente != null ? agente.getIdEmpleado() : "null",
            cliente.getIdCliente());

        return encuestaRepository.save(encuesta);
    }

    /**
     * Crea una encuesta usando el ID del agente (útil cuando solo tienes el ID).
     */
    @Transactional
    public Encuesta crearEncuestaParaTicket(Long plantillaId, Ticket ticket, Long agenteId, ClienteEntity cliente) {
        // El agente se puede obtener de las asignaciones del ticket si no se proporciona
        Agente agente = null;
        if (agenteId != null) {
            // Se necesitaría inyectar AgenteRepository, por ahora lo dejamos null
            // y se obtiene del ticket si es necesario
        }
        
        // Si no hay agenteId pero hay ticket, intentar obtener el último agente asignado
        if (agente == null && ticket != null && ticket.getAsignaciones() != null && !ticket.getAsignaciones().isEmpty()) {
            var ultimaAsignacion = ticket.getAsignaciones().stream()
                .filter(a -> a.getEmpleado() instanceof Agente)
                .reduce((first, second) -> second); // Obtener la última
            
            if (ultimaAsignacion.isPresent()) {
                agente = (Agente) ultimaAsignacion.get().getEmpleado();
            }
        }

        return crearEncuesta(plantillaId, ticket, agente, cliente);
    }

    // ==========================================
    // 3. LÓGICA DE PREGUNTAS (FACTORY + NORMALIZACIÓN)
    // ==========================================

    private void agregarPreguntaAPlantilla(Long plantillaId, PreguntaDTO dto) {
        PlantillaEncuesta plantilla = plantillaRepository.findById(plantillaId)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Plantilla no encontrada ID: " + plantillaId));

        // Uso de la Factory para crear la instancia correcta (Radio, Texto, etc.)
        String tipoKey = dto.getTipo() != null ? dto.getTipo().trim().toUpperCase() : "";
        // Soporte de aliases comunes entre frontend/back
        switch (tipoKey) {
            case "BOOLEAN":
            case "BOOLEANO":
            case "BOOLEANA":
                tipoKey = "BOOLEANA";
                break;
            case "TEXT":
            case "STRING":
                tipoKey = "TEXTO";
                break;
            // RADIO y otros quedan tal cual
        }

        PreguntaFactory factory = fabricasPreguntas.get(tipoKey);
        if (factory == null) throw new IllegalArgumentException("Tipo inválido: " + dto.getTipo() + " (normalizado a '" + tipoKey + "')");

        Pregunta pregunta = factory.crearPregunta();
        pregunta.setTexto(dto.getTexto());
        pregunta.setObligatoria(dto.isObligatoria());
        pregunta.setOrden(dto.getOrden() != null ? dto.getOrden() : plantilla.getPreguntas().size() + 1);
        pregunta.setPlantilla(plantilla);
        pregunta.setEsCalificacion(dto.isEsCalificacion());

        // Validar que no haya más de una pregunta de calificación por plantilla
        if (dto.isEsCalificacion()) {
            boolean yaExisteCalificacion = plantilla.getPreguntas().stream()
                .anyMatch(p -> Boolean.TRUE.equals(p.getEsCalificacion()));
            if (yaExisteCalificacion) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Ya existe una pregunta de calificación en esta plantilla");
            }
        }

        // Configuración específica según el tipo
        if (pregunta instanceof PreguntaTexto) {
            ((PreguntaTexto) pregunta).setLongitudMaxima(255);
        } else if (pregunta instanceof PreguntaRadio && dto.getOpciones() != null) {
            PreguntaRadio radio = (PreguntaRadio) pregunta;
            int orden = 1;
            // Aquí convertimos los Strings del DTO a Entidades OpcionPregunta
            for (String textoOpcion : dto.getOpciones()) {
                radio.agregarOpcion(textoOpcion, orden++);
            }
        }

        plantilla.getPreguntas().add(pregunta);
        plantillaRepository.save(plantilla);
    }

    // ==========================================
    // 4. GESTIÓN DE RESPUESTAS (EJECUCIÓN)
    // ==========================================

    @Transactional
    public void guardarRespuesta(RespuestaClienteDTO dto) {
        Encuesta encuesta = encuestaRepository.findById(dto.getIdEncuesta())
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Encuesta no existe o expiró"));

        RespuestaEncuesta respuestaGlobal = new RespuestaEncuesta();
        respuestaGlobal.setEncuesta(encuesta);
        respuestaGlobal.setFechaRespuesta(LocalDateTime.now());
        respuestaGlobal.setRespuestas(new ArrayList<>());

        boolean esCritica = false; // Bandera para el patrón Observer
        Integer calificacionExtraida = null; // Se extraerá de la pregunta marcada como calificación

        if (dto.getRespuestas() != null) {
            for (RespuestaClienteDTO.ItemRespuesta item : dto.getRespuestas()) {
                Pregunta pregunta = preguntaRepository.findById(item.getIdPregunta())
                    .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Pregunta no encontrada ID: " + item.getIdPregunta()));

                // VALIDACIÓN: Usar la lógica de cada tipo de pregunta
                boolean esValida = pregunta.validar(item.getValor());
                if (!esValida) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Respuesta inválida para la pregunta ID: " + item.getIdPregunta());
                }

                RespuestaPregunta resp = new RespuestaPregunta();
                resp.setPregunta(pregunta);
                // Guardamos el valor: Si es Radio, será el ID de la opción. Si es Texto, el texto.
                resp.setValor(item.getValor());
                resp.setRespuestaEncuesta(respuestaGlobal);
                
                respuestaGlobal.getRespuestas().add(resp);

                // Si esta pregunta es la de calificación, extraer el valor (1-5)
                if (Boolean.TRUE.equals(pregunta.getEsCalificacion())) {
                    calificacionExtraida = extraerCalificacionDeRespuesta(pregunta, item.getValor());
                    log.info("Calificación extraída de pregunta {}: {}", pregunta.getIdPregunta(), calificacionExtraida);
                }

                // Lógica de negocio para detectar alertas (calificación baja = crítica)
                if (pregunta instanceof PreguntaRadio && Boolean.TRUE.equals(pregunta.getEsCalificacion())) {
                    if (calificacionExtraida != null && calificacionExtraida <= 2) {
                        esCritica = true;
                    }
                }
            }
        }

        // Usar calificación extraída de la pregunta, o la enviada en el DTO como fallback
        Integer calificacionFinal = calificacionExtraida != null ? calificacionExtraida : dto.getCalificacion();
        
        // Validar que tengamos una calificación válida
        if (calificacionFinal == null || calificacionFinal < 1 || calificacionFinal > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se encontró una calificación válida (1-5). Asegúrese de responder la pregunta de calificación.");
        }

        // Guardamos la calificación general en la entidad de respuesta
        respuestaGlobal.setCalificacion(calificacionFinal);

        encuesta.setEstadoEncuesta(EstadoEncuesta.RESPONDIDA);
        encuesta.setRespuestaEncuesta(respuestaGlobal);
        encuestaRepository.save(encuesta);

        // PATRÓN OBSERVER: Lanzamos el evento al sistema
        eventPublisher.publishEvent(new EncuestaRespondidaEvent(
                encuesta.getIdEncuesta(), 
                encuesta.getPlantilla().getIdPlantillaEncuesta(), 
                esCritica
        ));
    }

    /**
     * Extrae el valor de calificación (1-5) de una respuesta.
     * Para preguntas Radio, busca el orden de la opción seleccionada.
     * Para otros tipos, intenta parsear el valor directamente.
     */
    private Integer extraerCalificacionDeRespuesta(Pregunta pregunta, String valor) {
        if (pregunta instanceof PreguntaRadio) {
            PreguntaRadio radio = (PreguntaRadio) pregunta;
            try {
                Long idOpcion = Long.parseLong(valor);
                // Buscar la opción y obtener su orden (1, 2, 3, 4, 5)
                return radio.getOpciones().stream()
                    .filter(op -> op.getIdOpcion().equals(idOpcion))
                    .findFirst()
                    .map(OpcionPregunta::getOrden)
                    .orElse(null);
            } catch (NumberFormatException e) {
                // Si el valor no es un ID, intentar parsearlo directamente
                try {
                    return Integer.parseInt(valor.trim().substring(0, 1)); // "1 - Muy malo" -> 1
                } catch (Exception ex) {
                    return null;
                }
            }
        } else {
            // Para otros tipos de pregunta, intentar parsear directamente
            try {
                return Integer.parseInt(valor.trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
    }

    @Transactional(readOnly = true)
    public List<EncuestaResultadoDTO> listarRespuestas(String alcance, String agenteId, LocalDate start, LocalDate end, Integer limit) {
        // PATRÓN SPECIFICATION: Construimos la consulta dinámica
        // "RespuestaEncuestaSpec" es la clase de filtros que creamos anteriormente
        Specification<RespuestaEncuesta> filtros = RespuestaEncuestaSpec.filtrarPorCriterios(alcance, agenteId, start, end);

        List<RespuestaEncuesta> resultados;

        // Si nos pasan un limit, usamos PageRequest para obtener los N más recientes (ordenados por fechaRespuesta desc)
        if (limit != null && limit > 0) {
            Page<RespuestaEncuesta> page = respuestaEncuestaRepository.findAll(filtros, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "fechaRespuesta")));
            resultados = page.getContent();
        } else {
            // Sin limit: devolver todos ordenados por fechaRespuesta desc para consistencia
            resultados = respuestaEncuestaRepository.findAll(filtros, Sort.by(Sort.Direction.DESC, "fechaRespuesta"));
        }

        // Mapeamos los resultados a DTOs para la vista
        return resultados.stream()
            .map(this::mapToEncuestaResultadoDTO)
            .collect(Collectors.toList());
    }

    private EncuestaResultadoDTO mapToEncuestaResultadoDTO(RespuestaEncuesta r) {
        Encuesta encuesta = r.getEncuesta();
        
        // Obtener nombre del agente si existe
        String nombreAgente = null;
        if (encuesta.getAgente() != null) {
            nombreAgente = encuesta.getAgente().getNombreCompleto();
        }
        
        // Obtener email/nombre del cliente
        String cliente = null;
        if (encuesta.getCliente() != null) {
            cliente = encuesta.getCliente().getCorreo();
        }
        
        // Obtener ticket ID real si existe
        String ticketId = encuesta.getTicket() != null 
            ? "T-" + encuesta.getTicket().getIdTicket()
            : "T-" + encuesta.getIdEncuesta();
        
        // Calcular puntaje (usar calificacion de la respuesta o promedio de respuestas numéricas)
        String puntaje = "N/A";
        if (r.getCalificacion() != null) {
            puntaje = r.getCalificacion() + "/5";
        } else if (r.getRespuestas() != null && !r.getRespuestas().isEmpty()) {
            // Intentar parsear valores numéricos de las respuestas
            double sum = 0;
            int count = 0;
            for (RespuestaPregunta rp : r.getRespuestas()) {
                if (rp.getValor() != null) {
                    try {
                        double val = Double.parseDouble(rp.getValor());
                        sum += val;
                        count++;
                    } catch (NumberFormatException e) {
                        // No es número, ignorar para el promedio
                    }
                }
            }
            if (count > 0) {
                double avg = sum / count;
                puntaje = String.format("%.1f/5", avg);
            }
        }
        
        // Buscar comentario en las respuestas de texto (respuestas que no son números)
        String comentario = "Sin comentarios";
        if (r.getRespuestas() != null) {
            for (RespuestaPregunta rp : r.getRespuestas()) {
                String val = rp.getValor();
                if (val != null && !val.trim().isEmpty()) {
                    // Verificar si NO es un número para considerar como comentario
                    try {
                        Double.parseDouble(val);
                        // Es número, continuar buscando
                    } catch (NumberFormatException e) {
                        // No es número, puede ser comentario si es largo
                        if (val.length() > 10) {
                            comentario = val;
                            break;
                        }
                    }
                }
            }
        }
        
        // Calcular tiempo relativo
        String tiempo = calcularTiempoRelativo(r.getFechaRespuesta());
        
        return EncuestaResultadoDTO.builder()
                .responseId(r.getIdRespuestaEncuesta().toString())
                .ticketId(ticketId)
                .agente(nombreAgente)
                .cliente(cliente)
                .puntaje(puntaje)
                .comentario(comentario)
                .tiempo(tiempo)
                .fechaRespuesta(r.getFechaRespuesta() != null ? r.getFechaRespuesta().toString() : null)
                .build();
    }

    private String calcularTiempoRelativo(LocalDateTime fecha) {
        if (fecha == null) return "-";
        
        LocalDateTime ahora = LocalDateTime.now();
        long minutos = java.time.Duration.between(fecha, ahora).toMinutes();
        
        if (minutos < 1) return "Hace un momento";
        if (minutos < 60) return "Hace " + minutos + " min";
        
        long horas = minutos / 60;
        if (horas < 24) return "Hace " + horas + " h";
        
        long dias = horas / 24;
        if (dias == 1) return "Ayer";
        if (dias < 7) return "Hace " + dias + " días";
        if (dias < 30) return "Hace " + (dias / 7) + " sem";
        
        return fecha.toLocalDate().toString();
    }

            @Transactional(readOnly = true)
            public java.util.List<com.sqrc.module.backendsqrc.encuesta.dto.EncuestaSummaryDTO> listarEncuestas() {
            return encuestaRepository.findAll().stream()
                .map(this::mapToEncuestaSummaryDTO)
                .collect(Collectors.toList());
            }

            @Transactional(readOnly = true)
            public java.util.List<com.sqrc.module.backendsqrc.encuesta.dto.EncuestaSummaryDTO> listarEncuestas(String estado, Integer limit, Integer page, Integer size) {
                // If estado is provided, filter by it; otherwise return all
                java.util.List<Encuesta> entidades;

                if (estado != null && !estado.isEmpty()) {
                    try {
                        EstadoEncuesta st = EstadoEncuesta.valueOf(estado.trim().toUpperCase());
                        if (page != null || size != null) {
                            int p = page != null ? page : 0;
                            int s = size != null ? size : 20;
                            entidades = encuestaRepository.findByEstadoEncuesta(st, PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "fechaEnvio"))).getContent();
                        } else if (limit != null && limit > 0) {
                            Page<Encuesta> pg = encuestaRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "fechaEnvio")));
                            entidades = pg.getContent().stream().filter(e -> e.getEstadoEncuesta() == st).collect(Collectors.toList());
                        } else {
                            entidades = encuestaRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaEnvio")).stream().filter(e -> e.getEstadoEncuesta() == st).collect(Collectors.toList());
                        }
                    } catch (IllegalArgumentException ex) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido: " + estado);
                    }
                } else {
                    if (page != null || size != null) {
                        int p = page != null ? page : 0;
                        int s = size != null ? size : 20;
                        entidades = encuestaRepository.findAll(PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "fechaEnvio"))).getContent();
                    } else if (limit != null && limit > 0) {
                        entidades = encuestaRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "fechaEnvio"))).getContent();
                    } else {
                        entidades = encuestaRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaEnvio"));
                    }
                }

                return entidades.stream()
                    .map(this::mapToEncuestaSummaryDTO)
                    .collect(Collectors.toList());
            }
    
    /**
     * Mapea una entidad Encuesta a EncuestaSummaryDTO incluyendo información del contexto.
     */
    private EncuestaSummaryDTO mapToEncuestaSummaryDTO(Encuesta e) {
        return EncuestaSummaryDTO.builder()
            .idEncuesta(e.getIdEncuesta())
            .plantillaId(e.getPlantilla() != null ? e.getPlantilla().getIdPlantillaEncuesta() : null)
            .plantillaNombre(e.getPlantilla() != null ? e.getPlantilla().getNombre() : null)
            .estado(e.getEstadoEncuesta() != null ? e.getEstadoEncuesta().name() : null)
            .alcanceEvaluacion(e.getAlcanceEvaluacion() != null ? e.getAlcanceEvaluacion().name() : null)
            .fechaEnvio(e.getFechaEnvio() != null ? e.getFechaEnvio().toString() : null)
            .fechaExpiracion(e.getFechaExpiracion() != null ? e.getFechaExpiracion().toString() : null)
            .resendCount(e.getResendCount() != null ? e.getResendCount() : 0)
            .lastSentAt(e.getLastSentAt() != null ? e.getLastSentAt().toString() : null)
            // Información del contexto
            .ticketId(e.getTicket() != null ? e.getTicket().getIdTicket() : null)
            .agenteId(e.getAgente() != null ? e.getAgente().getIdEmpleado() : null)
            .agenteNombre(e.getAgente() != null ? e.getAgente().getNombre() + " " + e.getAgente().getApellido() : null)
            .clienteId(e.getCliente() != null ? e.getCliente().getIdCliente() : null)
            .clienteNombre(e.getCliente() != null ? e.getCliente().getNombres() + " " + e.getCliente().getApellidos() : null)
            .build();
    }

    @Transactional(readOnly = true)
    public EncuestaResultadoDTO obtenerRespuestaPorId(String idStr) {
        Long id = Long.parseLong(idStr);
        RespuestaEncuesta respuestaDB = respuestaEncuestaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Respuesta no encontrada"));

        // Obtener datos de la encuesta (cliente, agente)
        Encuesta encuesta = respuestaDB.getEncuesta();
        String clienteEmail = encuesta.getCliente() != null ? encuesta.getCliente().getCorreo() : "N/A";
        String agenteNombre = encuesta.getAgente() != null ? encuesta.getAgente().getNombreCompleto() : "N/A";

        // Transformamos las respuestas para el detalle
        List<ResultadoPreguntaDTO> detalles = respuestaDB.getRespuestas().stream().map(resp -> {
            String valorMostrar = resp.getValor();
            Pregunta p = resp.getPregunta();
            String tipo = "TEXT"; // Default

            // Determinar el tipo según la clase de pregunta
            if (p instanceof PreguntaBooleana) {
                tipo = "BOOLEAN";
                // Convertir true/false a Sí/No
                if ("true".equalsIgnoreCase(valorMostrar)) {
                    valorMostrar = "Sí";
                } else if ("false".equalsIgnoreCase(valorMostrar)) {
                    valorMostrar = "No";
                }
            } else if (p instanceof PreguntaRadio) {
                tipo = "RATING";
                try {
                    Long idOpcion = Long.parseLong(valorMostrar);
                    // Buscamos en la lista de opciones de la pregunta
                    OpcionPregunta opcionEncontrada = ((PreguntaRadio) p).getOpciones().stream()
                            .filter(op -> op.getIdOpcion().equals(idOpcion))
                            .findFirst()
                            .orElse(null);
                    
                    if (opcionEncontrada != null && opcionEncontrada.getOrden() != null) {
                        // Devolver el orden (1-5) para que el frontend muestre la calificación
                        valorMostrar = String.valueOf(opcionEncontrada.getOrden());
                    } else if (opcionEncontrada != null) {
                        valorMostrar = opcionEncontrada.getTexto();
                    } else {
                        valorMostrar = valorMostrar + " (Opción no encontrada)";
                    }
                } catch (NumberFormatException e) {
                    // Si no era un número, lo mostramos tal cual
                }
            }
            // else TEXT ya está por default

            return ResultadoPreguntaDTO.builder()
                    .question(p.getTexto())
                    .answer(valorMostrar)
                    .type(tipo)
                    .build();
        }).collect(Collectors.toList());

        // Compute puntaje (e.g., "3/5") from la calificacion guardada
        String puntaje = respuestaDB.getCalificacion() != null ? respuestaDB.getCalificacion().toString() + "/5" : null;

        // Extract a primary textual comentario from the first TEXT answer (if any)
        String comentario = detalles.stream()
            .filter(d -> d.getType() != null && d.getType().equalsIgnoreCase("TEXT"))
            .map(ResultadoPreguntaDTO::getAnswer)
            .filter(a -> a != null && !a.isBlank())
            .findFirst().orElse(null);

        // Tiempo: use fechaRespuesta as ISO string for now
        String tiempo = respuestaDB.getFechaRespuesta() != null ? respuestaDB.getFechaRespuesta().toString() : null;

        return EncuestaResultadoDTO.builder()
            .responseId(respuestaDB.getIdRespuestaEncuesta().toString())
            .ticketId("T-" + encuesta.getIdEncuesta())
            .agente(agenteNombre)
            .agenteName(agenteNombre)
            .cliente(clienteEmail)
            .clientEmail(clienteEmail)
            .puntaje(puntaje)
            .comentario(comentario)
            .tiempo(tiempo)
            .fechaRespuesta(respuestaDB.getFechaRespuesta().toString())
            .resultados(detalles)
            .build();
    }

    /**
     * Obtiene los datos de una encuesta para que el cliente la responda.
     * Incluye las preguntas de la plantilla con sus opciones.
     */
    @Transactional(readOnly = true)
    public EncuestaEjecucionDTO obtenerEncuestaParaEjecucion(Long encuestaId) {
        Encuesta encuesta = encuestaRepository.findByIdWithPlantillaAndPreguntas(encuestaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Encuesta no encontrada"));

        PlantillaEncuesta plantilla = encuesta.getPlantilla();
        
        // Mapear preguntas
                List<EncuestaEjecucionDTO.PreguntaEjecucionDTO> preguntasDTO = plantilla.getPreguntas().stream()
            .map(p -> {
                List<EncuestaEjecucionDTO.OpcionDTO> opciones = null;
                String tipo = "TEXT";
                
                if (p instanceof PreguntaRadio) {
                    tipo = "RADIO";
                    PreguntaRadio preguntaRadio = (PreguntaRadio) p;
                    // Forzar inicialización de opciones (lazy)
                    List<OpcionPregunta> opcionesRadio = preguntaRadio.getOpciones();
                    if (opcionesRadio != null) {
                        opcionesRadio.size(); // Inicializar la colección lazy
                        opciones = opcionesRadio.stream()
                            .map(op -> EncuestaEjecucionDTO.OpcionDTO.builder()
                                .idOpcion(op.getIdOpcion())
                                .texto(op.getTexto())
                                .orden(op.getOrden())
                                .valor(op.getOrden()) // Usar orden como valor numérico
                                .build())
                            .sorted((a, b) -> (a.getOrden() != null ? a.getOrden() : 0) - (b.getOrden() != null ? b.getOrden() : 0))
                            .collect(Collectors.toList());
                    }
                } else if (p instanceof PreguntaBooleana) {
                    tipo = "BOOLEAN";
                }
                
                return EncuestaEjecucionDTO.PreguntaEjecucionDTO.builder()
                    .idPregunta(p.getIdPregunta())
                    .texto(p.getTexto())
                    .tipo(tipo)
                    .obligatoria(p.getObligatoria())
                    .orden(p.getOrden())
                    .esCalificacion(Boolean.TRUE.equals(p.getEsCalificacion()))
                    .opciones(opciones)
                    .build();
            })
            .sorted((a, b) -> {
                // La pregunta de calificación siempre va al final (mejor UX)
                if (Boolean.TRUE.equals(a.getEsCalificacion()) && !Boolean.TRUE.equals(b.getEsCalificacion())) return 1;
                if (!Boolean.TRUE.equals(a.getEsCalificacion()) && Boolean.TRUE.equals(b.getEsCalificacion())) return -1;
                // Luego ordenar por el campo 'orden'
                return (a.getOrden() != null ? a.getOrden() : 0) - (b.getOrden() != null ? b.getOrden() : 0);
            })
            .collect(Collectors.toList());

        // Obtener nombre del agente si aplica
        String agenteNombre = null;
        if (encuesta.getAgente() != null) {
            agenteNombre = encuesta.getAgente().getNombre() + " " + encuesta.getAgente().getApellido();
        }

        // Obtener nombre del cliente
        String clienteNombre = null;
        if (encuesta.getCliente() != null) {
            clienteNombre = encuesta.getCliente().getNombres() + " " + encuesta.getCliente().getApellidos();
        }

        return EncuestaEjecucionDTO.builder()
            .idEncuesta(encuesta.getIdEncuesta())
            .plantillaNombre(plantilla.getNombre())
            .plantillaDescripcion(plantilla.getDescripcion())
            .estado(encuesta.getEstadoEncuesta() != null ? encuesta.getEstadoEncuesta().name() : null)
            .alcanceEvaluacion(encuesta.getAlcanceEvaluacion() != null ? encuesta.getAlcanceEvaluacion().name() : null)
            .agenteNombre(agenteNombre)
            .clienteNombre(clienteNombre)
            .preguntas(preguntasDTO)
            .build();
    }

    @Transactional
    public void reenviarEncuesta(String idStr) {
        Long id = Long.parseLong(idStr);
        Encuesta encuesta = encuestaRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Encuesta no encontrada"));

        if (encuesta.getEstadoEncuesta() == EstadoEncuesta.RESPONDIDA) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "La encuesta ya fue respondida, no se puede reenviar.");
        }

        // Actualizar metadata de reenvío
        encuesta.setFechaEnvio(LocalDateTime.now());
        encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
        Integer count = encuesta.getResendCount();
        if (count == null) count = 0;
        encuesta.setResendCount(count + 1);
        encuesta.setLastSentAt(LocalDateTime.now());
        // lastSentBy could be filled from security context when available
        encuesta.setLastSentBy(null);

        encuestaRepository.save(encuesta);

        // Intentar enviar correo de forma asíncrona si hay un destinatario configurado
        if (testRecipient != null && !testRecipient.isBlank()) {
            String subject = "Reenvío encuesta #" + encuesta.getIdEncuesta();
            String body = "Estimado/a, por favor complete la encuesta en el siguiente enlace: [ENLACE DE ENCUESTA]";
            try {
                emailService.enviarCorreoHtmlAsync(testRecipient, subject, body);
            } catch (Exception ex) {
                System.err.println("Error al encolar envío de correo: " + ex.getMessage());
            }
        } else {
            System.out.println("No hay destinatario configurado (app.test.recipient) — registro de reenvío guardado, sin envío de correo.");
        }
    }

    @Transactional(readOnly = true)
    public boolean isEncuestaRespondida(String idStr) {
        try {
            Long id = Long.parseLong(idStr);
            Encuesta encuesta = encuestaRepository.findById(id).orElse(null);
            return encuesta != null && encuesta.getEstadoEncuesta() == EstadoEncuesta.RESPONDIDA;
        } catch (Exception ex) {
            return false;
        }
    }

    @Transactional
    public void enviarEncuestaManual(String idStr, String correoDestino, String asunto, boolean attachPdf) {
        Long id = Long.parseLong(idStr);

        // Coger la encuesta con bloqueo PESSIMISTIC_WRITE para evitar reenvíos concurrentes
        Encuesta encuesta = encuestaRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Encuesta no encontrada"));

        // Guardia de ventana: no reenviar si lastSentAt dentro de la ventana configurada
        LocalDateTime ahora = LocalDateTime.now();
        if (encuesta.getLastSentAt() != null) {
            LocalDateTime limite = ahora.minusHours(resendWindowHours);
            if (encuesta.getLastSentAt().isAfter(limite)) {
                log.info("Omitiendo reenvío de encuesta {} — lastSentAt={} dentro de ventana de {} horas", encuesta.getIdEncuesta(), encuesta.getLastSentAt(), resendWindowHours);
                return; // no hacemos nada
            }
        }

        String subject = (asunto != null && !asunto.isBlank()) ? asunto : "Encuesta #" + encuesta.getIdEncuesta();
        String plantillaNombre = encuesta.getPlantilla() != null ? encuesta.getPlantilla().getNombre() : "Encuesta";
        String link = frontendUrl + "/encuestas/exec/" + encuesta.getIdEncuesta();

        StringBuilder html = new StringBuilder();
        html.append("<p>Estimado/a,</p>");
        html.append("<p>Por favor complete la encuesta: <strong>").append(plantillaNombre).append("</strong>.</p>");
        html.append("<p><a href=\"").append(link).append("\">Abrir encuesta</a></p>");
        html.append("<p>Si no puede abrir el enlace, copie y pegue la siguiente URL en su navegador:<br/>").append(link).append("</p>");

        // Actualizar metadata (ya tenemos la entidad bajo lock)
        encuesta.setFechaEnvio(ahora);
        encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
        Integer count = encuesta.getResendCount();
        if (count == null) count = 0;
        encuesta.setResendCount(count + 1);
        encuesta.setLastSentAt(ahora);
        encuestaRepository.save(encuesta);

        try {
            if (attachPdf) {
                byte[] pdf = pdfService.generarPdfDesdeHtml(html.toString());
                String filename = "encuesta-" + encuesta.getIdEncuesta() + ".pdf";
                emailService.enviarCorreoConAdjunto(correoDestino, subject, html.toString(), pdf, filename);
            } else {
                emailService.enviarCorreoHtmlAsync(correoDestino, subject, html.toString());
            }
        } catch (Exception ex) {
            log.error("Error al enviar correo de encuesta {}: {}", encuesta.getIdEncuesta(), ex.getMessage(), ex);
            throw new RuntimeException("Error al enviar correo: " + ex.getMessage(), ex);
        }
    }

    // ==========================================
    // UTILITARIOS
    // ==========================================

    private PlantillaResponseDTO convertirADTO(PlantillaEncuesta entidad) {
            List<PreguntaDTO> preguntasDTO = entidad.getPreguntas().stream().map(p -> {
            List<String> opciones = null;
            String tipo = "TEXT";

            if (p instanceof PreguntaRadio) {
                tipo = "RADIO";
                // Convertimos las entidades OpcionPregunta a una lista de Strings simple para el Frontend
                opciones = ((PreguntaRadio) p).getOpciones().stream()
                        .map(OpcionPregunta::getTexto)
                        .collect(Collectors.toList());
            } else if (p instanceof PreguntaBooleana) {
                tipo = "BOOLEAN";
            }

            return PreguntaDTO.builder()
                    .texto(p.getTexto())
                    .tipo(tipo)
                    .orden(p.getOrden())
                    .obligatoria(p.getObligatoria())
                    .esCalificacion(Boolean.TRUE.equals(p.getEsCalificacion()))
                    .opciones(opciones)
                    .build();
        }).collect(Collectors.toList());

        return PlantillaResponseDTO.builder()
                .templateId(entidad.getIdPlantillaEncuesta().toString())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
            .estado(entidad.getVigente() ? "ACTIVA" : "INACTIVA")
            .alcanceEvaluacion(entidad.getAlcanceEvaluacion() != null ? entidad.getAlcanceEvaluacion().name() : null)
                .preguntas(preguntasDTO)
                .build();
    }
}