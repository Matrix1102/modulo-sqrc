package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;


import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.PlantillaDefault;
import org.springframework.stereotype.Service;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantillaService {


    private final PlantillaRepository plantillaRepository;
    private final PlantillaMapper mapper;

    public PlantillaService(PlantillaRepository plantillaRepository, PlantillaMapper mapper) {
        this.plantillaRepository = plantillaRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PlantillaResumenResponseDTO> listarTodas() {
        return plantillaRepository.findAll().stream()
                .map(mapper::toResumenDTO) // Convertimos aquí mismo
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlantillaResumenResponseDTO> listarActivasPorCaso(TipoCaso caso) {
        List<Plantilla> lista;
        if (caso == null) {
            lista = plantillaRepository.findByActivoTrueOrderByNombreAsc();
        } else {
            lista = plantillaRepository.findByTipoCasoAndActivoTrue(caso);
        }

        return lista.stream()
                .map(mapper::toResumenDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlantillaResumenResponseDTO obtenerPorIdResumen(Long id) {
        Plantilla plantilla = plantillaRepository.findById(id).orElseThrow(
                () -> new RuntimeException("No se encontró la plantilla con ID: " + id)
        );
        return mapper.toResumenDTO(plantilla);
    }

    @Transactional(readOnly = true)
    public PlantillaDetalleResponseDTO obtenerPorIdDetalle(Long id) {
        Plantilla plantilla = plantillaRepository.findById(id).orElseThrow(
                () -> new RuntimeException("No se encontró la plantilla con ID: " + id)
        );
        return mapper.toDetalleDTO(plantilla);
    }

    @Transactional(readOnly = true)
    public Plantilla obtenerPorId(Long id) {
        Plantilla plantilla = plantillaRepository.findById(id).orElseThrow(
                () -> new RuntimeException("No se encontró la plantilla con ID: " + id)
        );
        return plantilla;
    }


    @Transactional
    public PlantillaCreacionResponseDTO crearPlantilla(CrearPlantillaRequestDTO request) {

        Plantilla plantilla = new Plantilla();
        plantilla.setNombre(request.nombreInterno());
        plantilla.setTituloVisible(request.tituloVisible());
        plantilla.setTipoCaso(request.tipoCaso());
        plantilla.setCuerpo(request.cuerpo());
        plantilla.setDespedida(request.despedida());

        // gloica del HTML (prioridad al request, si no, default)
        if (request.htmlModelo() != null && !request.htmlModelo().isBlank()) {
            plantilla.setHtmlModel(request.htmlModelo());
        } else {
            plantilla.setHtmlModel(PlantillaDefault.HTML_FORMAL);
        }

        // validaciones
        validarCamposObligatorios(plantilla);

        if (plantillaRepository.existsByNombre(plantilla.getNombre())) {
            throw new RuntimeException("Ya existe una plantilla con el nombre interno: " + plantilla.getNombre());
        }

        // completar datos
        plantilla.setActivo(true);
        plantilla.setIdPlantilla(null);
        plantilla.setFechaCreacion(LocalDateTime.now());
        plantilla.setFechaModificacion(LocalDateTime.now());

        // guardar
        Plantilla guardada = plantillaRepository.save(plantilla);

        // retorno
        return mapper.toCreacionDTO(guardada);
    }

    @Transactional
    public PlantillaDetalleResponseDTO actualizarPlantilla(Long id, ActualizarPlantillaRequestDTO request) {

        Plantilla plantillaDB = obtenerPorId(id);

        // validar duplicados (regla: si el nombre cambió Y el nuevo ya existe)
        if (!plantillaDB.getNombre().equalsIgnoreCase(request.nombreInterno())
                && plantillaRepository.existsByNombre(request.nombreInterno())) {
            throw new RuntimeException("El nombre '" + request.nombreInterno() + "' ya está en uso.");
        }


        plantillaDB.setNombre(request.nombreInterno());
        plantillaDB.setTituloVisible(request.tituloVisible());
        plantillaDB.setTipoCaso(request.tipoCaso());
        plantillaDB.setCuerpo(request.cuerpo());
        plantillaDB.setDespedida(request.despedida());


        if (request.htmlModelo() != null && !request.htmlModelo().isBlank()) {
            plantillaDB.setHtmlModel(request.htmlModelo());
        }

        // validar integridad (que no hayamos dejado campos vacíos al setear)
        validarCamposObligatorios(plantillaDB);


        plantillaDB.setFechaModificacion(LocalDateTime.now());


        Plantilla actualizada = plantillaRepository.save(plantillaDB);

        // retornar el DTO de detalle (usando el mapper de salida)
        return mapper.toDetalleDTO(actualizada);
    }

    @Transactional
    public void desactivarPlantilla(Long id) {
        //borado logico
        Plantilla plantilla = obtenerPorId(id);
        plantilla.setActivo(false);
        plantilla.setFechaModificacion(LocalDateTime.now());
        plantillaRepository.save(plantilla);
    }

    @Transactional
    public void reactivarPlantilla(Long id) {

        Plantilla plantilla = obtenerPorId(id);
        plantilla.setActivo(true);
        plantilla.setFechaModificacion(LocalDateTime.now());
        plantillaRepository.save(plantilla);
    }

    private void validarCamposObligatorios(Plantilla p) {
        if (esInvalido(p.getNombre()) ||
                esInvalido(p.getTituloVisible()) ||
                esInvalido(p.getCuerpo()) ||
                esInvalido(p.getDespedida()) ||
                p.getTipoCaso() == null) { // Enum no puede ser null

            throw new RuntimeException("Todos los campos obligatorios deben estar llenos.");
        }
    }

    private boolean esInvalido(String texto) {
        return texto == null || texto.trim().isEmpty();
    }

    @Transactional(readOnly = true)
    public String obtenerHtmlBase() {
        // 1. Intentamos buscar el diseño de la Plantilla #1 (Nuestra "Maestra" en la BD)
        return plantillaRepository.findHtmlModelById(1L)
                .orElse(PlantillaDefault.HTML_FORMAL); // 2. Fallback: Si borraron la 1, usamos la del código (seguridad)
    }
}
