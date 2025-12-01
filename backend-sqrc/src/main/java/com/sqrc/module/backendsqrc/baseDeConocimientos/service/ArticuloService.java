package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.FeedbackArticuloRepository;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio principal para la gestión de artículos de conocimiento.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArticuloService {

    private final ArticuloRepository articuloRepository;
    private final ArticuloVersionRepository versionRepository;
    private final FeedbackArticuloRepository feedbackRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Crea un nuevo artículo con su versión inicial.
     */
    public ArticuloResponse crearArticulo(CrearArticuloRequest request) {
        log.info("Creando nuevo artículo con código: {}", request.getCodigo());

        // Verificar que el código no exista
        if (articuloRepository.existsByCodigo(request.getCodigo())) {
            throw new CodigoArticuloDuplicadoException(request.getCodigo());
        }

        // Obtener el propietario
        Empleado propietario = empleadoRepository.findById(request.getIdPropietario())
                .orElseThrow(() -> new OperacionInvalidaException(
                        "Empleado no encontrado con ID: " + request.getIdPropietario()));

        // Crear el artículo
        Articulo articulo = Articulo.builder()
                .codigo(request.getCodigo())
                .titulo(request.getTitulo())
                .resumen(request.getResumen())
                .etiqueta(request.getEtiqueta())
                .tipoCaso(request.getTipoCaso() != null ? request.getTipoCaso() : TipoCaso.TODOS)
                .visibilidad(request.getVisibilidad())
                .vigenteDesde(request.getVigenteDesde())
                .vigenteHasta(request.getVigenteHasta())
                .propietario(propietario)
                .ultimoEditor(propietario)
                .build();

        articulo = articuloRepository.save(articulo);

        // Crear la versión inicial
        ArticuloVersion versionInicial = ArticuloVersion.builder()
                .articulo(articulo)
                .numeroVersion(1)
                .contenido(request.getContenidoInicial())
                .notaCambio(request.getNotaCambioInicial() != null ? request.getNotaCambioInicial() : "Versión inicial")
                .creadoPor(propietario)
                .creadoEn(LocalDateTime.now())
                .esVigente(false)
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(OrigenVersion.MANUAL)
                .build();

        versionRepository.save(versionInicial);

        log.info("Artículo creado exitosamente con ID: {}", articulo.getIdArticulo());

        return mapToResponse(articulo);
    }

    /**
     * Obtiene un artículo por su ID.
     */
    @Transactional(readOnly = true)
    public ArticuloResponse obtenerPorId(Integer id) {
        Articulo articulo = articuloRepository.findById(id)
                .orElseThrow(() -> new ArticuloNotFoundException(id));
        return mapToResponse(articulo);
    }

    /**
     * Obtiene un artículo por su código.
     */
    @Transactional(readOnly = true)
    public ArticuloResponse obtenerPorCodigo(String codigo) {
        Articulo articulo = articuloRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ArticuloNotFoundException("codigo", codigo));
        return mapToResponse(articulo);
    }

    /**
     * Actualiza un artículo existente.
     */
    public ArticuloResponse actualizarArticulo(Integer id, ActualizarArticuloRequest request) {
        log.info("Actualizando artículo ID: {}", id);

        Articulo articulo = articuloRepository.findById(id)
                .orElseThrow(() -> new ArticuloNotFoundException(id));

        if (request.getTitulo() != null) {
            articulo.setTitulo(request.getTitulo());
        }
        if (request.getResumen() != null) {
            articulo.setResumen(request.getResumen());
        }
        if (request.getEtiqueta() != null) {
            articulo.setEtiqueta(request.getEtiqueta());
        }
        if (request.getTipoCaso() != null) {
            articulo.setTipoCaso(request.getTipoCaso());
        }
        if (request.getVisibilidad() != null) {
            articulo.setVisibilidad(request.getVisibilidad());
        }
        if (request.getVigenteDesde() != null) {
            articulo.setVigenteDesde(request.getVigenteDesde());
        }
        if (request.getVigenteHasta() != null) {
            articulo.setVigenteHasta(request.getVigenteHasta());
        }
        if (request.getIdUltimoEditor() != null) {
            Empleado editor = empleadoRepository.findById(request.getIdUltimoEditor())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Empleado no encontrado con ID: " + request.getIdUltimoEditor()));
            articulo.setUltimoEditor(editor);
        }

        articulo = articuloRepository.save(articulo);

        log.info("Artículo ID: {} actualizado exitosamente", id);

        return mapToResponse(articulo);
    }

    /**
     * Elimina un artículo (solo si está en borrador).
     */
    public void eliminarArticulo(Integer id) {
        log.info("Eliminando artículo ID: {}", id);

        Articulo articulo = articuloRepository.findById(id)
                .orElseThrow(() -> new ArticuloNotFoundException(id));

        // Verificar que no tenga versiones publicadas
        boolean tienePublicadas = articulo.getVersiones().stream()
                .anyMatch(v -> v.getEstadoPropuesta() == EstadoArticulo.PUBLICADO);

        if (tienePublicadas) {
            throw new OperacionInvalidaException(
                    "No se puede eliminar un artículo que tiene versiones publicadas. Archívelo en su lugar.");
        }

        articuloRepository.delete(articulo);
        log.info("Artículo ID: {} eliminado exitosamente", id);
    }

    /**
     * Busca artículos con filtros.
     */
    @Transactional(readOnly = true)
    public PaginaResponse<ArticuloResumenResponse> buscarArticulos(BusquedaArticuloRequest request) {
        log.debug("Buscando artículos con filtros: {}", request);

        Sort sort = Sort.by(
                request.getDireccion() != null && request.getDireccion().equalsIgnoreCase("ASC")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC,
                request.getOrdenarPor() != null ? request.getOrdenarPor() : "actualizadoEn");

        Pageable pageable = PageRequest.of(
                request.getPagina() != null ? request.getPagina() : 0,
                request.getTamanoPagina() != null ? request.getTamanoPagina() : 10,
                sort);

        Page<Articulo> page = articuloRepository.buscarConFiltros(
                request.getEtiqueta(),
                request.getVisibilidad(),
                request.getTipoCaso(),
                request.getTexto(),
                pageable);

        List<ArticuloResumenResponse> contenido = page.getContent().stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());

        return PaginaResponse.<ArticuloResumenResponse>builder()
                .contenido(contenido)
                .paginaActual(page.getNumber())
                .totalPaginas(page.getTotalPages())
                .totalElementos(page.getTotalElements())
                .tamanoPagina(page.getSize())
                .esPrimera(page.isFirst())
                .esUltima(page.isLast())
                .tieneAnterior(page.hasPrevious())
                .tieneSiguiente(page.hasNext())
                .build();
    }

    /**
     * Obtiene artículos publicados visibles para un rol.
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerArticulosPublicados(Visibilidad visibilidad) {
        return articuloRepository.findArticulosPublicados(visibilidad).stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene artículos del propietario (mis artículos).
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerMisArticulos(Long idEmpleado) {
        return articuloRepository.findByPropietarioIdEmpleado(idEmpleado).stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene artículos propuestos (borradores) del empleado.
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerMisBorradores(Long idEmpleado) {
        return articuloRepository.findBorradoresPorEmpleado(idEmpleado).stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene artículos deprecados (vencidos).
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerArticulosDeprecados() {
        return articuloRepository.findArticulosDeprecados(LocalDateTime.now()).stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene artículos más populares.
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerMasPopulares(int limite) {
        return articuloRepository.findMasPopulares(PageRequest.of(0, limite)).getContent().stream()
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Busca sugerencias de artículos activos por palabras clave.
     * Retorna artículos ordenados por relevancia (coincidencia en título > resumen
     * > tags)
     * y cantidad de feedbacks positivos.
     * Solo incluye artículos con versión publicada y vigentes en la fecha actual.
     * 
     * @param palabrasClave Texto a buscar (puede contener múltiples palabras)
     * @param visibilidad   Visibilidad requerida (AGENTE siempre visible,
     *                      SUPERVISOR solo para supervisores)
     * @param limite        Número máximo de sugerencias a retornar
     * @return Lista de artículos ordenados por relevancia
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> buscarSugerencias(String palabrasClave, Visibilidad visibilidad, int limite) {
        if (palabrasClave == null || palabrasClave.trim().isEmpty()) {
            return List.of();
        }

        log.debug("Buscando sugerencias para: '{}' con límite: {}", palabrasClave, limite);

        // Buscar con cada palabra clave y combinar resultados
        String[] palabras = palabrasClave.trim().toLowerCase().split("\\s+");

        List<Articulo> resultados = articuloRepository.buscarSugerenciasActivas(
                palabrasClave.trim(),
                visibilidad,
                LocalDateTime.now(),
                PageRequest.of(0, limite * 2) // Obtener más para permitir filtrado
        );

        // Calcular score de relevancia para ordenar mejor
        return resultados.stream()
                .map(articulo -> {
                    int score = calcularScoreRelevancia(articulo, palabras);
                    return new Object[] { articulo, score };
                })
                .sorted((a, b) -> Integer.compare((int) b[1], (int) a[1]))
                .limit(limite)
                .map(arr -> mapToResumen((Articulo) arr[0]))
                .collect(Collectors.toList());
    }

    /**
     * Calcula un score de relevancia para un artículo basado en las palabras clave.
     */
    private int calcularScoreRelevancia(Articulo articulo, String[] palabras) {
        int score = 0;
        String titulo = articulo.getTitulo() != null ? articulo.getTitulo().toLowerCase() : "";
        String resumen = articulo.getResumen() != null ? articulo.getResumen().toLowerCase() : "";
        String tags = articulo.getTags() != null ? articulo.getTags().toLowerCase() : "";

        for (String palabra : palabras) {
            // Título tiene mayor peso (x3)
            if (titulo.contains(palabra)) {
                score += 30;
                // Bonus si la palabra está al inicio del título
                if (titulo.startsWith(palabra)) {
                    score += 10;
                }
            }
            // Resumen tiene peso medio (x2)
            if (resumen.contains(palabra)) {
                score += 20;
            }
            // Tags tienen peso base (x1)
            if (tags.contains(palabra)) {
                score += 10;
            }
        }

        // Bonus por feedbacks positivos
        ArticuloVersion versionVigente = articulo.getVersionVigente();
        if (versionVigente != null) {
            Long feedbacksPositivos = feedbackRepository.contarFeedbacksUtiles(versionVigente.getIdArticuloVersion());
            score += feedbacksPositivos != null ? feedbacksPositivos.intValue() * 5 : 0;
        }

        return score;
    }

    /**
     * Genera un código único para un nuevo artículo.
     */
    public String generarCodigoUnico() {
        String prefijo = "KB-";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefijo + timestamp + "-" + uuid;
    }

    // ===================== MÉTODOS DE MAPEO =====================

    private ArticuloResponse mapToResponse(Articulo articulo) {
        ArticuloVersion versionVigente = articulo.getVersionVigente();

        Long feedbacksPositivos = 0L;
        Double calificacionPromedio = 0.0;

        if (versionVigente != null) {
            feedbacksPositivos = feedbackRepository.contarFeedbacksUtiles(versionVigente.getIdArticuloVersion());
            calificacionPromedio = feedbackRepository
                    .calcularCalificacionPromedio(versionVigente.getIdArticuloVersion());
        }

        return ArticuloResponse.builder()
                .idArticulo(articulo.getIdArticulo())
                .codigo(articulo.getCodigo())
                .titulo(articulo.getTitulo())
                .resumen(articulo.getResumen())
                .etiqueta(articulo.getEtiqueta())
                .tipoCaso(articulo.getTipoCaso())
                .visibilidad(articulo.getVisibilidad())
                .vigenteDesde(articulo.getVigenteDesde())
                .vigenteHasta(articulo.getVigenteHasta())
                .tags(articulo.getTags())
                .creadoEn(articulo.getCreadoEn())
                .actualizadoEn(articulo.getActualizadoEn())
                .idPropietario(articulo.getPropietario() != null ? articulo.getPropietario().getIdEmpleado() : null)
                .nombrePropietario(articulo.getPropietario() != null ? articulo.getPropietario().getNombre() : null)
                .idUltimoEditor(articulo.getUltimoEditor() != null ? articulo.getUltimoEditor().getIdEmpleado() : null)
                .nombreUltimoEditor(articulo.getUltimoEditor() != null ? articulo.getUltimoEditor().getNombre() : null)
                .versionVigente(versionVigente != null ? versionVigente.getNumeroVersion() : null)
                .estadoVersionVigente(versionVigente != null ? versionVigente.getEstadoPropuesta() : null)
                .contenidoVersionVigente(versionVigente != null ? versionVigente.getContenido() : null)
                .totalVersiones(articulo.getVersiones() != null ? articulo.getVersiones().size() : 0)
                .feedbacksPositivos(feedbacksPositivos)
                .calificacionPromedio(calificacionPromedio != null ? calificacionPromedio : 0.0)
                .estaVigente(articulo.estaVigente())
                .build();
    }

    private ArticuloResumenResponse mapToResumen(Articulo articulo) {
        ArticuloVersion versionVigente = articulo.getVersionVigente();
        ArticuloVersion ultimaVersion = articulo.getVersiones().isEmpty() ? null : articulo.getVersiones().get(0);

        Long feedbacksPositivos = 0L;
        if (versionVigente != null) {
            feedbacksPositivos = feedbackRepository.contarFeedbacksUtiles(versionVigente.getIdArticuloVersion());
        }

        String estado = "Borrador";
        if (versionVigente != null && versionVigente.getEstadoPropuesta() == EstadoArticulo.PUBLICADO) {
            estado = "Publicado";
        } else if (!articulo.estaVigente()) {
            estado = "Vencido";
        } else if (ultimaVersion != null) {
            estado = ultimaVersion.getEstadoPropuesta().name();
        }

        return ArticuloResumenResponse.builder()
                .idArticulo(articulo.getIdArticulo())
                .codigo(articulo.getCodigo())
                .titulo(articulo.getTitulo())
                .resumen(articulo.getResumen())
                .etiqueta(articulo.getEtiqueta())
                .tipoCaso(articulo.getTipoCaso())
                .visibilidad(articulo.getVisibilidad())
                .tags(articulo.getTags())
                .nombrePropietario(articulo.getPropietario() != null ? articulo.getPropietario().getNombre() : null)
                .fechaModificacion(articulo.getActualizadoEn() != null
                        ? articulo.getActualizadoEn().format(FECHA_FORMATTER)
                        : articulo.getCreadoEn().format(FECHA_FORMATTER))
                .versionActual(versionVigente != null ? versionVigente.getNumeroVersion()
                        : (ultimaVersion != null ? ultimaVersion.getNumeroVersion() : 0))
                .feedbacksPositivos(feedbacksPositivos)
                .vistas(0L) // TODO: Implementar contador de vistas
                .estaVigente(articulo.estaVigente())
                .estado(estado)
                .build();
    }
}
