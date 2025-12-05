package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.FeedbackArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.specification.ArticuloSpecificationBuilder;
import com.sqrc.module.backendsqrc.baseDeConocimientos.specification.ArticuloSpecifications;
import com.sqrc.module.backendsqrc.baseDeConocimientos.specification.Specification;
import com.sqrc.module.backendsqrc.ticket.model.Documentacion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.DocumentacionRepository;
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
    private final DocumentacionRepository documentacionRepository;
    private final GeminiService geminiService;

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
                .vigenteDesde(request.getVigenteDesde() != null ? request.getVigenteDesde().atStartOfDay() : null)
                .vigenteHasta(request.getVigenteHasta() != null ? request.getVigenteHasta().atTime(23, 59, 59) : null)
                .tags(request.getTags())
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
            articulo.setVigenteDesde(request.getVigenteDesde().atStartOfDay());
        }
        if (request.getVigenteHasta() != null) {
            articulo.setVigenteHasta(request.getVigenteHasta().atTime(23, 59, 59));
        }
        if (request.getIdUltimoEditor() != null) {
            Empleado editor = empleadoRepository.findById(request.getIdUltimoEditor())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Empleado no encontrado con ID: " + request.getIdUltimoEditor()));
            articulo.setUltimoEditor(editor);
        }
        if (request.getTags() != null) {
            articulo.setTags(request.getTags());
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
     * Busca artículos con filtros usando FULLTEXT search.
     */
    @Transactional(readOnly = true)
    public PaginaResponse<ArticuloResumenResponse> buscarArticulos(BusquedaArticuloRequest request) {
        log.debug("Buscando artículos con filtros: {}", request);

        // Para nativeQuery no podemos usar Sort de Spring directamente con nombres de
        // campo Java
        // El ORDER BY está incluido en la query nativa
        Pageable pageable = PageRequest.of(
                request.getPagina() != null ? request.getPagina() : 0,
                request.getTamanoPagina() != null ? request.getTamanoPagina() : 10);

        // Convertir enums a String para la query nativa
        String etiquetaStr = request.getEtiqueta() != null ? request.getEtiqueta().name() : null;
        String visibilidadStr = request.getVisibilidad() != null ? request.getVisibilidad().name() : null;
        String tipoCasoStr = request.getTipoCaso() != null ? request.getTipoCaso().name() : null;

        // Preparar texto de búsqueda para FULLTEXT (agregar * para búsqueda por prefijo
        // si tiene contenido)
        String textoSearch = request.getTexto();
        if (textoSearch != null && !textoSearch.trim().isEmpty()) {
            textoSearch = textoSearch.trim();
        }

        Page<Articulo> page = articuloRepository.buscarConFiltros(
                etiquetaStr,
                visibilidadStr,
                tipoCasoStr,
                textoSearch,
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

    // ===================== MÉTODOS CON SPECIFICATION PATTERN =====================
    
    /**
     * Busca artículos usando el patrón Specification para filtrado flexible.
     * Permite combinar múltiples criterios de filtrado de forma dinámica.
     * 
     * @param request Parámetros de búsqueda
     * @return Lista de artículos que cumplen todas las especificaciones
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> buscarConSpecification(BusquedaArticuloRequest request) {
        log.debug("Buscando artículos con Specification Pattern: {}", request);
        
        // Construir especificación desde el request
        Specification<Articulo> specification = ArticuloSpecificationBuilder
                .desdeRequest(request)
                .build();
        
        // Cargar todos los artículos y filtrar con la especificación
        List<Articulo> articulos = articuloRepository.findAll();
        
        return articulos.stream()
                .filter(specification::isSatisfiedBy)
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene artículos disponibles para agentes usando Specification Pattern.
     * (Publicados, vigentes, y con visibilidad para agentes)
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerDisponiblesParaAgentesConSpec() {
        Specification<Articulo> spec = ArticuloSpecifications.disponibleParaAgentes();
        
        return articuloRepository.findAll().stream()
                .filter(spec::isSatisfiedBy)
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene artículos que requieren atención usando Specification Pattern.
     * (Tienen versiones en borrador o propuestas pendientes)
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> obtenerRequierenAtencionConSpec() {
        Specification<Articulo> spec = ArticuloSpecifications.requiereAtencion();
        
        return articuloRepository.findAll().stream()
                .filter(spec::isSatisfiedBy)
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }
    
    /**
     * Filtra artículos con especificación personalizada.
     * Permite a los controladores pasar especificaciones construidas dinámicamente.
     * 
     * @param specification Especificación a aplicar
     * @return Lista de artículos filtrados
     */
    @Transactional(readOnly = true)
    public List<ArticuloResumenResponse> filtrarConSpecification(Specification<Articulo> specification) {
        log.debug("Filtrando artículos con especificación personalizada");
        
        return articuloRepository.findAll().stream()
                .filter(specification::isSatisfiedBy)
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }
    
    /**
     * Cuenta artículos que cumplen una especificación.
     * Útil para dashboards y reportes.
     */
    @Transactional(readOnly = true)
    public long contarConSpecification(Specification<Articulo> specification) {
        return articuloRepository.findAll().stream()
                .filter(specification::isSatisfiedBy)
                .count();
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
     * Busca sugerencias de artículos activos por palabras clave usando FULLTEXT.
     * Busca en título, resumen, tags y contenido de la versión vigente.
     * Retorna artículos ordenados por relevancia FULLTEXT y cantidad de feedbacks
     * positivos.
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

        String textoBusqueda = palabrasClave.trim();
        log.debug("Buscando sugerencias FULLTEXT para: '{}' con límite: {}", textoBusqueda, limite);

        // Buscar usando FULLTEXT (query nativa)
        List<Object[]> resultadosFulltext = articuloRepository.buscarSugerenciasFulltext(
                textoBusqueda,
                visibilidad != null ? visibilidad.name() : null,
                LocalDateTime.now(),
                limite);

        if (resultadosFulltext.isEmpty()) {
            log.debug("No se encontraron resultados FULLTEXT para: '{}'", textoBusqueda);
            return List.of();
        }

        // Obtener los IDs de los artículos encontrados (mantienen el orden por
        // relevancia)
        List<Integer> idsOrdenados = resultadosFulltext.stream()
                .map(row -> ((Number) row[0]).intValue())
                .collect(Collectors.toList());

        // Cargar los artículos completos
        List<Articulo> articulos = articuloRepository.findAllById(idsOrdenados);

        // Ordenar según el orden de relevancia original
        return idsOrdenados.stream()
                .map(id -> articulos.stream()
                        .filter(a -> a.getIdArticulo().equals(id))
                        .findFirst()
                        .orElse(null))
                .filter(a -> a != null)
                .map(this::mapToResumen)
                .collect(Collectors.toList());
    }

    /**
     * Calcula un score de relevancia para un artículo basado en las palabras clave.
     * Método de respaldo para ordenamiento adicional si es necesario.
     */
    private int calcularScoreRelevancia(Articulo articulo, String[] palabras) {
        int score = 0;
        String titulo = articulo.getTitulo() != null ? articulo.getTitulo().toLowerCase() : "";
        String resumen = articulo.getResumen() != null ? articulo.getResumen().toLowerCase() : "";
        String tags = articulo.getTags() != null ? articulo.getTags().toLowerCase() : "";

        // Obtener contenido de la versión vigente
        String contenido = "";
        ArticuloVersion versionVigente = articulo.getVersionVigente();
        if (versionVigente != null && versionVigente.getContenido() != null) {
            contenido = versionVigente.getContenido().toLowerCase();
        }

        for (String palabra : palabras) {
            // Título tiene mayor peso (x4)
            if (titulo.contains(palabra)) {
                score += 40;
                // Bonus si la palabra está al inicio del título
                if (titulo.startsWith(palabra)) {
                    score += 10;
                }
            }
            // Resumen tiene peso alto (x3)
            if (resumen.contains(palabra)) {
                score += 30;
            }
            // Tags tienen peso medio (x2)
            if (tags.contains(palabra)) {
                score += 20;
            }
            // Contenido tiene peso base (x1)
            if (contenido.contains(palabra)) {
                score += 10;
            }
        }

        // Bonus por feedbacks positivos
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
        // Si no hay versión vigente, usar la última versión disponible (para
        // borradores)
        ArticuloVersion versionMostrar = versionVigente;
        if (versionMostrar == null && articulo.getVersiones() != null && !articulo.getVersiones().isEmpty()) {
            versionMostrar = articulo.getVersiones().get(0);
        }

        Long feedbacksPositivos = 0L;
        Double calificacionPromedio = 0.0;

        if (versionMostrar != null) {
            feedbacksPositivos = feedbackRepository.contarFeedbacksUtiles(versionMostrar.getIdArticuloVersion());
            calificacionPromedio = feedbackRepository
                    .calcularCalificacionPromedio(versionMostrar.getIdArticuloVersion());
        }

        // Extraer información del propietario (empleado creador)
        Empleado propietario = articulo.getPropietario();
        Long idPropietario = propietario != null ? propietario.getIdEmpleado() : null;
        String nombrePropietario = propietario != null ? propietario.getNombre() : null;
        String apellidoPropietario = propietario != null ? propietario.getApellido() : null;
        String nombreCompletoPropietario = propietario != null ? propietario.getNombreCompleto() : null;

        // Extraer información del último editor (empleado)
        Empleado ultimoEditor = articulo.getUltimoEditor();
        Long idUltimoEditor = ultimoEditor != null ? ultimoEditor.getIdEmpleado() : null;
        String nombreUltimoEditor = ultimoEditor != null ? ultimoEditor.getNombre() : null;
        String apellidoUltimoEditor = ultimoEditor != null ? ultimoEditor.getApellido() : null;
        String nombreCompletoUltimoEditor = ultimoEditor != null ? ultimoEditor.getNombreCompleto() : null;

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
                // Información del propietario (empleado)
                .idPropietario(idPropietario)
                .nombrePropietario(nombrePropietario)
                .apellidoPropietario(apellidoPropietario)
                .nombreCompletoPropietario(nombreCompletoPropietario)
                // Información del último editor (empleado)
                .idUltimoEditor(idUltimoEditor)
                .nombreUltimoEditor(nombreUltimoEditor)
                .apellidoUltimoEditor(apellidoUltimoEditor)
                .nombreCompletoUltimoEditor(nombreCompletoUltimoEditor)
                // Versión vigente
                .versionVigente(versionMostrar != null ? versionMostrar.getNumeroVersion() : null)
                .estadoVersionVigente(versionMostrar != null ? versionMostrar.getEstadoPropuesta() : null)
                .contenidoVersionVigente(versionMostrar != null ? versionMostrar.getContenido() : null)
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

    /**
     * Genera un artículo de conocimiento a partir de una documentación usando IA
     * (Gemini 2.5 Flash).
     * Hace un join desde documentación con asignaciones para obtener el contexto
     * completo.
     * 
     * @param idDocumentacion     ID de la documentación
     * @param idEmpleado          ID del empleado que solicita (será el propietario)
     * @param guardarComoBorrador Si es true, guarda el artículo automáticamente
     * @return ArticuloGeneradoIA con el contenido generado
     */
    public ArticuloGeneradoIA generarArticuloDesdeDocumentacion(
            Long idDocumentacion,
            Long idEmpleado,
            boolean guardarComoBorrador) {

        log.info("🤖 Generando artículo con IA desde documentación ID: {}", idDocumentacion);

        // Verificar que Gemini está configurado
        if (!geminiService.estaConfigurado()) {
            throw new OperacionInvalidaException("El servicio de IA (Gemini) no está configurado correctamente");
        }

        // Buscar la documentación con su asignación y ticket
        Documentacion documentacion = documentacionRepository.findById(idDocumentacion)
                .orElseThrow(() -> new OperacionInvalidaException(
                        "Documentación no encontrada con ID: " + idDocumentacion));

        // Obtener el contexto completo (join con asignación y ticket)
        ContextoDocumentacionDTO contexto = construirContextoDesdeDocumentacion(documentacion);

        // Llamar a Gemini para generar el artículo
        ArticuloGeneradoIA articuloGenerado = geminiService.generarArticuloDesdeContexto(contexto);

        // Si se solicita guardar como borrador
        if (guardarComoBorrador && idEmpleado != null) {
            ArticuloResponse articuloGuardado = guardarArticuloGenerado(articuloGenerado, idEmpleado, idDocumentacion);
            articuloGenerado.setIdArticuloCreado(articuloGuardado.getIdArticulo());
            articuloGenerado.setCodigoArticuloCreado(articuloGuardado.getCodigo());
            log.info("✅ Artículo generado y guardado con código: {}", articuloGuardado.getCodigo());
        }

        return articuloGenerado;
    }

    /**
     * Construye el DTO de contexto desde la documentación con join a asignación y
     * ticket.
     */
    private ContextoDocumentacionDTO construirContextoDesdeDocumentacion(Documentacion documentacion) {
        // Obtener ticket desde la asignación
        Ticket ticket = documentacion.getAsignacion().getTicket();

        ContextoDocumentacionDTO.ContextoDocumentacionDTOBuilder builder = ContextoDocumentacionDTO.builder()
                .idDocumentacion(documentacion.getIdDocumentacion())
                .problema(documentacion.getProblema())
                .solucion(documentacion.getSolucion())
                .fechaDocumentacion(documentacion.getFechaCreacion() != null
                        ? documentacion.getFechaCreacion().format(FECHA_FORMATTER)
                        : null)
                .idAsignacion(documentacion.getAsignacion().getIdAsignacion())
                .fechaInicioAsignacion(documentacion.getAsignacion().getFechaInicio() != null
                        ? documentacion.getAsignacion().getFechaInicio().format(FECHA_FORMATTER)
                        : null)
                .fechaFinAsignacion(documentacion.getAsignacion().getFechaFin() != null
                        ? documentacion.getAsignacion().getFechaFin().format(FECHA_FORMATTER)
                        : null);

        // Datos del agente
        if (documentacion.getAsignacion().getEmpleado() != null) {
            builder.nombreAgente(documentacion.getAsignacion().getEmpleado().getNombre() + " " +
                    documentacion.getAsignacion().getEmpleado().getApellido());
        }

        // Datos del ticket
        if (ticket != null) {
            builder.idTicket(ticket.getIdTicket())
                    .asuntoTicket(ticket.getAsunto())
                    .descripcionTicket(ticket.getDescripcion())
                    .tipoTicket(ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : null)
                    .estadoTicket(ticket.getEstado() != null ? ticket.getEstado().name() : null)
                    .origenTicket(ticket.getOrigen() != null ? ticket.getOrigen().name() : null);

            // Motivo del ticket
            if (ticket.getMotivo() != null) {
                builder.motivoTicket(ticket.getMotivo().getNombre());
            }
        }

        return builder.build();
    }

    /**
     * Guarda el artículo generado por IA como borrador.
     */
    private ArticuloResponse guardarArticuloGenerado(ArticuloGeneradoIA generado, Long idEmpleado,
            Long idDocumentacion) {
        // Generar código único basado en documentación
        String codigo = "IA-DOC" + idDocumentacion + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        CrearArticuloRequest request = CrearArticuloRequest.builder()
                .codigo(codigo)
                .titulo(generado.getTitulo())
                .resumen(generado.getResumen())
                .etiqueta(generado.getEtiqueta())
                .tipoCaso(generado.getTipoCaso())
                .visibilidad(generado.getVisibilidad())
                .tags(generado.getTags())
                .idPropietario(idEmpleado)
                .contenidoInicial(generado.getContenido())
                .notaCambioInicial("Generado automáticamente con IA desde documentación #" + idDocumentacion)
                .build();

        return crearArticulo(request);
    }
}
