package com.sqrc.module.backendsqrc.encuesta.service;

import com.sqrc.module.backendsqrc.encuesta.dto.*; // Importa tus DTOs
import com.sqrc.module.backendsqrc.encuesta.factory.PreguntaFactory;
import com.sqrc.module.backendsqrc.encuesta.model.*;
import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;
import com.sqrc.module.backendsqrc.encuesta.repository.PlantillaRepository;
// import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository; // TODO: Descomentar cuando exista

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private EncuestaRepository encuestaRepository;
    @Autowired
    private PlantillaRepository plantillaRepository;
    @Autowired
    private Map<String, PreguntaFactory> fabricasPreguntas;
    // @Autowired private TicketRepository ticketRepository; // Descomenta si
    // validas tickets reales

    // ==========================================
    // 1. GESTIÓN DE PLANTILLAS (CRUD)
    // ==========================================

    @Transactional(readOnly = true)
    public List<PlantillaResponseDTO> listarPlantillas() {
        // Buscamos todas las entidades y las convertimos a DTOs
        List<PlantillaEncuesta> entidades = plantillaRepository.findAll();

        return entidades.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlantillaResponseDTO crearPlantilla(PlantillaRequestDTO dto) {
        PlantillaEncuesta plantilla = new PlantillaEncuesta();
        plantilla.setNombre(dto.getNombre());
        plantilla.setDescripcion(dto.getDescripcion());
        plantilla.setVigente(true);
        plantilla.setPreguntas(new ArrayList<>());

        // Guardamos primero para tener ID
        plantilla = plantillaRepository.save(plantilla);

        // Si el DTO viene con preguntas iniciales, las creamos usando el Factory
        if (dto.getPreguntas() != null) {
            for (PreguntaDTO pDto : dto.getPreguntas()) {
                agregarPreguntaAPlantilla(plantilla.getIdPlantillaEncuesta(), pDto);
            }
        }

        return convertirADTO(plantilla);
    }

    @Transactional(readOnly = true)
    public PlantillaResponseDTO obtenerPlantillaPorId(String idStr) {
        Long id = Long.parseLong(idStr); // Convertimos String a Long
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));
        return convertirADTO(plantilla);
    }

    @Transactional
    public PlantillaResponseDTO actualizarPlantilla(String idStr, PlantillaRequestDTO dto) {
        Long id = Long.parseLong(idStr);
        PlantillaEncuesta plantilla = plantillaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));

        plantilla.setNombre(dto.getNombre());
        plantilla.setDescripcion(dto.getDescripcion());
        // Aquí podrías actualizar las preguntas, pero es complejo.
        // Por ahora actualizamos solo cabecera.

        PlantillaEncuesta actualizada = plantillaRepository.save(plantilla);
        return convertirADTO(actualizada);
    }

    // ==========================================
    // 2. LOGICA DE PREGUNTAS (FACTORY)
    // ==========================================

    // Este método reutiliza tu lógica de Factory
    private void agregarPreguntaAPlantilla(Long plantillaId, PreguntaDTO dto) {
        PlantillaEncuesta plantilla = plantillaRepository.findById(plantillaId).orElseThrow();

        PreguntaFactory factory = fabricasPreguntas.get(dto.getTipo());
        if (factory == null)
            throw new IllegalArgumentException("Tipo inválido: " + dto.getTipo());

        Pregunta pregunta = factory.crearPregunta();
        pregunta.setTexto(dto.getTexto());
        pregunta.setObligatoria(dto.isObligatoria());
        pregunta.setOrden(dto.getOrden() != null ? dto.getOrden() : plantilla.getPreguntas().size() + 1);
        pregunta.setPlantilla(plantilla);

        // Configuración específica
        if (pregunta instanceof PreguntaTexto) {
            ((PreguntaTexto) pregunta).setLongitudMaxima(255);
        } else if (pregunta instanceof PreguntaRadio && dto.getOpciones() != null) {
            String opcionesString = String.join(",", dto.getOpciones());
            ((PreguntaRadio) pregunta).setOpciones(opcionesString);
        }

        plantilla.getPreguntas().add(pregunta);
        // No es necesario save explícito si la lista es gestionada, pero por seguridad:
        plantillaRepository.save(plantilla);
    }

    // ==========================================
    // 3. DASHBOARD Y MÉTRICAS
    // ==========================================

    public SurveyDashboardDTO obtenerKpisEncuestas(LocalDate start, LocalDate end) {
        // AQUÍ IRÍA LA LÓGICA REAL DE CÁLCULO CON REPOSITORIOS
        // Por ahora devolvemos datos simulados para que el Controller funcione
        return SurveyDashboardDTO.builder()
                .csatPromedioAgente(4.5)
                .csatPromedioServicio(4.1)
                .totalRespuestas(85)
                .tasaRespuestaPct(65.0)
                .build();
    }

    // ==========================================
    // 4. RESPUESTAS DE CLIENTES
    // ==========================================

    @Transactional
    public void guardarRespuesta(RespuestaClienteDTO dto) {
        // 1. Buscar la Encuesta Enviada (la instancia "viva")
        // OJO: Necesitas tener el repositorio de Encuesta inyectado
        Encuesta encuesta = encuestaRepository.findById(dto.getIdEncuesta())
                .orElseThrow(() -> new RuntimeException("Encuesta no existe o expiró"));

        // 2. Crear el objeto respuesta
        RespuestaEncuesta respuestaGlobal = new RespuestaEncuesta();
        respuestaGlobal.setEncuesta(encuesta);
        respuestaGlobal.setFechaRespuesta(LocalDateTime.now());
        respuestaGlobal.setRespuestas(new ArrayList<>());

        // 3. Mapear cada respuesta individual
        // (Aquí requerirías lógica para buscar las preguntas por ID y asignarlas)

        // 4. Guardar estado
        encuesta.setEstadoEncuesta(EstadoEncuesta.RESPONDIDA);
        encuesta.setRespuestaEncuesta(respuestaGlobal);

        encuestaRepository.save(encuesta);
    }

    // ==========================================
    // UTILITARIOS (Mappers)
    // ==========================================

    private PlantillaResponseDTO convertirADTO(PlantillaEncuesta entidad) {
        List<PreguntaDTO> preguntasDTO = entidad.getPreguntas().stream().map(p -> {
            List<String> opciones = null;
            String tipo = "TEXTO"; // Default

            if (p instanceof PreguntaRadio) {
                tipo = "RADIO";
                opciones = ((PreguntaRadio) p).getListaOpciones();
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
                .preguntas(preguntasDTO)
                .build();
    }

    public List<EncuestaResultadoDTO> listarRespuestas(String alcance, String agenteId, LocalDate start,
            LocalDate end) {
        // TODO: Implementar lógica de búsqueda con filtros en Repositorio
        return new ArrayList<>();
    }

    public EncuestaResultadoDTO obtenerRespuestaPorId(String id) {
        // TODO: Buscar por ID y convertir a DTO
        return EncuestaResultadoDTO.builder().build();
    }

    public void reenviarEncuesta(String id) {
        // TODO: Lógica de reenvío de correo
        System.out.println("Reenviando encuesta " + id);
    }
}