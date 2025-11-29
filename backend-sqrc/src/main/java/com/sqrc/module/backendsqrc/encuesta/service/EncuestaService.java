package com.sqrc.module.backendsqrc.encuesta.service;

import com.sqrc.module.backendsqrc.encuesta.dto.*;
import com.sqrc.module.backendsqrc.encuesta.event.EncuestaRespondidaEvent;
import com.sqrc.module.backendsqrc.encuesta.factory.PreguntaFactory;
import com.sqrc.module.backendsqrc.encuesta.model.*;
import com.sqrc.module.backendsqrc.encuesta.repository.*;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EncuestaService {

    // Inyección de Dependencias (Patrón DI)
    @Autowired private EncuestaRepository encuestaRepository;
    @Autowired private PlantillaEncuestaRepository plantillaRepository;
    @Autowired private PreguntaRepository preguntaRepository;
    @Autowired private RespuestaEncuestaRepository respuestaEncuestaRepository;
    @Autowired private Map<String, PreguntaFactory> fabricasPreguntas; // Patrón Factory
    @Autowired private ApplicationEventPublisher eventPublisher;       // Patrón Observer

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

        if (dto.getPreguntas() != null) {
            for (PreguntaDTO pDto : dto.getPreguntas()) {
                agregarPreguntaAPlantilla(plantilla.getIdPlantillaEncuesta(), pDto);
            }
        }
        return convertirADTO(plantilla);
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
    // 2. LÓGICA DE PREGUNTAS (FACTORY + NORMALIZACIÓN)
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
    // 3. GESTIÓN DE RESPUESTAS (EJECUCIÓN)
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

                // Ejemplo de lógica de negocio para detectar alertas
                // Si es una pregunta Radio y el valor es "1" (ID de "Muy Malo"), activamos alerta
                if (pregunta instanceof PreguntaRadio && "1".equals(item.getValor())) {
                    esCritica = true;
                }
            }
        }

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
            .map(r -> EncuestaResultadoDTO.builder()
                    .responseId(r.getIdRespuestaEncuesta().toString())
                    .ticketId("T-" + r.getEncuesta().getIdEncuesta()) // Simulación de ID Ticket
                    .fechaRespuesta(r.getFechaRespuesta().toString())
                    // Aquí podrías agregar lógica para calcular el puntaje promedio de esta respuesta
                    .puntaje("N/A") 
                    .comentario("Respuesta completada")
                    .build())
            .collect(Collectors.toList());
    }

            @Transactional(readOnly = true)
            public java.util.List<com.sqrc.module.backendsqrc.encuesta.dto.EncuestaSummaryDTO> listarEncuestas() {
            return encuestaRepository.findAll().stream()
                .map(e -> com.sqrc.module.backendsqrc.encuesta.dto.EncuestaSummaryDTO.builder()
                    .idEncuesta(e.getIdEncuesta())
                    .plantillaId(e.getPlantilla() != null ? e.getPlantilla().getIdPlantillaEncuesta() : null)
                    .estado(e.getEstadoEncuesta() != null ? e.getEstadoEncuesta().name() : null)
                    .fechaEnvio(e.getFechaEnvio() != null ? e.getFechaEnvio().toString() : null)
                    .build())
                .collect(Collectors.toList());
            }

    @Transactional(readOnly = true)
    public EncuestaResultadoDTO obtenerRespuestaPorId(String idStr) {
        Long id = Long.parseLong(idStr);
        RespuestaEncuesta respuestaDB = respuestaEncuestaRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Respuesta no encontrada"));

        // Transformamos las respuestas para el detalle
        List<ResultadoPreguntaDTO> detalles = respuestaDB.getRespuestas().stream().map(resp -> {
            String valorMostrar = resp.getValor();
            Pregunta p = resp.getPregunta();

            // Si es Radio, el valor guardado es un ID ("52"). Hay que buscar el texto ("Excelente").
            if (p instanceof PreguntaRadio) {
                try {
                    Long idOpcion = Long.parseLong(valorMostrar);
                    // Buscamos en la lista de opciones de la pregunta
                    valorMostrar = ((PreguntaRadio) p).getOpciones().stream()
                            .filter(op -> op.getIdOpcion().equals(idOpcion))
                            .findFirst()
                            .map(OpcionPregunta::getTexto)
                            .orElse(valorMostrar + " (Opción no encontrada)");
                } catch (NumberFormatException e) {
                    // Si no era un número, lo mostramos tal cual
                }
            }

            return ResultadoPreguntaDTO.builder()
                    .pregunta(p.getTexto())
                    .respuesta(valorMostrar)
                    .build();
        }).collect(Collectors.toList());

        return EncuestaResultadoDTO.builder()
                .responseId(respuestaDB.getIdRespuestaEncuesta().toString())
                .ticketId("T-" + respuestaDB.getEncuesta().getIdEncuesta())
                .fechaRespuesta(respuestaDB.getFechaRespuesta().toString())
                .resultados(detalles)
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

        encuesta.setFechaEnvio(LocalDateTime.now());
        encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
        encuestaRepository.save(encuesta);

        // Aquí se invocaría al EmailService real
        System.out.println("Simulando reenvío de correo para encuesta " + id);
    }

    // ==========================================
    // UTILITARIOS
    // ==========================================

    private PlantillaResponseDTO convertirADTO(PlantillaEncuesta entidad) {
        List<PreguntaDTO> preguntasDTO = entidad.getPreguntas().stream().map(p -> {
            List<String> opciones = null;
            String tipo = "TEXTO";

            if (p instanceof PreguntaRadio) {
                tipo = "RADIO";
                // Convertimos las entidades OpcionPregunta a una lista de Strings simple para el Frontend
                opciones = ((PreguntaRadio) p).getOpciones().stream()
                        .map(OpcionPregunta::getTexto)
                        .collect(Collectors.toList());
            } else if (p instanceof PreguntaBooleana) {
                tipo = "BOOLEANA";
            }

            return PreguntaDTO.builder()
                    .texto(p.getTexto())
                    .tipo(tipo)
                    .orden(p.getOrden())
                    .obligatoria(p.getObligatoria())
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