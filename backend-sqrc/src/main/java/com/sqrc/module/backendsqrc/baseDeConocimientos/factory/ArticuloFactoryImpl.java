package com.sqrc.module.backendsqrc.baseDeConocimientos.factory;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.ArticuloEventPublisher;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Factory Pattern - Implementación concreta para la creación de artículos.
 * 
 * <p>Esta implementación encapsula toda la lógica de creación de artículos
 * y sus versiones, siguiendo el patrón Factory Method.</p>
 * 
 * <p><b>Responsabilidades:</b></p>
 * <ul>
 *   <li>Crear artículos con código único generado</li>
 *   <li>Crear versiones iniciales para nuevos artículos</li>
 *   <li>Persistir tanto el artículo como su versión inicial</li>
 *   <li>Crear nuevas versiones para artículos existentes</li>
 *   <li>Publicar eventos mediante Observer Pattern</li>
 * </ul>
 * 
 * <p><b>Patrones utilizados:</b></p>
 * <ul>
 *   <li><b>Factory Method:</b> Cada método de creación encapsula la construcción</li>
 *   <li><b>Builder:</b> Usa Lombok @Builder para construir objetos complejos</li>
 *   <li><b>Observer:</b> Notifica eventos de artículos a los observers registrados</li>
 * </ul>
 * 
 * @see ArticuloFactory
 * @see ArticuloCreationContext
 * @see ArticuloEventPublisher
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ArticuloFactoryImpl implements ArticuloFactory {
    
    private final ArticuloRepository articuloRepository;
    private final ArticuloVersionRepository versionRepository;
    private final ArticuloEventPublisher eventPublisher; // Observer Pattern
    
    private static final String CODIGO_PREFIJO = "KB-IA-";
    
    @Override
    public Articulo crearArticulo(ArticuloCreationContext context) {
        log.info("Factory: Creando artículo con origen: {}", context.getOrigenVersion());
        
        // 1. Crear el artículo sin persistir
        Articulo articulo = crearArticuloSinPersistir(
                context.getContenidoGenerado(), 
                context.getCreador());
        
        // 2. Persistir el artículo
        articulo = articuloRepository.save(articulo);
        
        // 3. Crear y persistir la versión inicial
        ArticuloVersion version = crearVersionInicial(
                articulo,
                context.getContenidoGenerado().getContenido(),
                context.getCreador(),
                context.getNotaCambio(),
                context.getOrigenVersion(),
                context.getTicketOrigen());
        
        version = versionRepository.save(version);
        
        // 4. Observer Pattern: Publicar evento de artículo creado
        eventPublisher.publicar(ArticuloEvent.articuloCreado(
                articulo, version, context.getCreador()));
        
        log.info("Factory: Artículo creado exitosamente: {} con versión {}", 
                articulo.getCodigo(), version.getNumeroVersion());
        
        return articulo;
    }
    
    @Override
    public Articulo crearArticuloSinPersistir(ArticuloGeneradoIA contenido, Empleado creador) {
        String codigo = generarCodigoUnico();
        
        return Articulo.builder()
                .codigo(codigo)
                .titulo(contenido.getTitulo())
                .resumen(contenido.getResumen())
                .etiqueta(contenido.getEtiqueta())
                .tipoCaso(contenido.getTipoCaso())
                .visibilidad(contenido.getVisibilidad())
                .tags(contenido.getTags())
                .propietario(creador)
                .ultimoEditor(creador)
                .vigenteDesde(LocalDateTime.now())
                .build();
    }
    
    @Override
    public ArticuloVersion crearVersion(Articulo articulo, String contenido,
                                         Empleado creador, String notaCambio, Ticket ticketOrigen) {
        // Determinar el número de versión
        int numeroVersion = articulo.getVersiones() != null 
                ? articulo.getVersiones().size() + 1 
                : 1;
        
        ArticuloVersion version = ArticuloVersion.builder()
                .articulo(articulo)
                .numeroVersion(numeroVersion)
                .contenido(contenido)
                .notaCambio(notaCambio != null ? notaCambio : "Nueva versión creada")
                .creadoPor(creador)
                .creadoEn(LocalDateTime.now())
                .esVigente(false) // Se publica manualmente después de revisión
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(OrigenVersion.MANUAL)
                .ticketOrigen(ticketOrigen)
                .build();
        
        version = versionRepository.save(version);
        
        // Observer Pattern: Publicar evento de versión creada
        eventPublisher.publicar(ArticuloEvent.versionCreada(articulo, version, creador));
        
        log.info("Factory: Versión {} creada para artículo {}", 
                numeroVersion, articulo.getCodigo());
        
        return version;
    }
    
    @Override
    public String generarCodigoUnico() {
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return CODIGO_PREFIJO + timestamp + "-" + uuid;
    }
    
    // ===================== MÉTODOS PRIVADOS =====================
    
    /**
     * Crea la versión inicial para un nuevo artículo.
     */
    private ArticuloVersion crearVersionInicial(Articulo articulo, String contenido,
                                                  Empleado creador, String notaCambio,
                                                  OrigenVersion origen, Ticket ticketOrigen) {
        return ArticuloVersion.builder()
                .articulo(articulo)
                .numeroVersion(1)
                .contenido(contenido)
                .notaCambio(notaCambio != null ? notaCambio : "Versión inicial generada con IA")
                .creadoPor(creador)
                .creadoEn(LocalDateTime.now())
                .esVigente(false) // Se publica manualmente después de revisión
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(origen != null ? origen : OrigenVersion.MANUAL)
                .ticketOrigen(ticketOrigen)
                .build();
    }
}
