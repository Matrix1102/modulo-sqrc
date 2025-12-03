package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa una versión específica de un artículo de conocimiento.
 * Cada artículo puede tener múltiples versiones, permitiendo el historial de
 * cambios.
 */
@Entity
@Table(name = "articulo_versiones", indexes = {
        @Index(name = "idx_version_articulo", columnList = "id_articulo"),
        @Index(name = "idx_version_vigente", columnList = "es_vigente"),
        @Index(name = "idx_version_estado", columnList = "estado_propuesta"),
        @Index(name = "idx_version_origen", columnList = "origen")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticuloVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_version")
    private Integer idArticuloVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_articulo", nullable = false)
    private Articulo articulo;

    @Column(name = "numero_version", nullable = false)
    private Integer numeroVersion;

    @Column(name = "contenido", columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "nota_cambio", length = 255)
    private String notaCambio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", nullable = false)
    private Empleado creadoPor;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "es_vigente", nullable = false)
    @Builder.Default
    private Boolean esVigente = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_propuesta", length = 15, nullable = false)
    @Builder.Default
    private EstadoArticulo estadoPropuesta = EstadoArticulo.BORRADOR;

    @Enumerated(EnumType.STRING)
    @Column(name = "origen", length = 30, nullable = false)
    @Builder.Default
    private OrigenVersion origen = OrigenVersion.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket")
    private Ticket ticketOrigen;

    @OneToMany(mappedBy = "articuloVersion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FeedbackArticulo> feedbacks = new ArrayList<>();

    /**
     * Marca esta versión como la vigente y desmarca cualquier otra versión vigente
     * del mismo artículo.
     */
    public void marcarComoVigente() {
        if (this.articulo != null) {
            this.articulo.getVersiones().forEach(v -> v.setEsVigente(false));
        }
        this.esVigente = true;
        this.estadoPropuesta = EstadoArticulo.PUBLICADO;
    }

    /**
     * Obtiene el contenido de la versión.
     */
    public String obtenerContenido() {
        return this.contenido;
    }

    /**
     * Publica la versión estableciendo la fecha de vigencia desde.
     */
    public void publicar(LocalDateTime desde) {
        if (this.articulo != null) {
            this.articulo.setVigenteDesde(desde);
        }
        marcarComoVigente();
    }

    /**
     * Archiva la versión estableciendo la fecha de vigencia hasta.
     */
    public void archivar(LocalDateTime hasta) {
        if (this.articulo != null) {
            this.articulo.setVigenteHasta(hasta);
        }
        this.esVigente = false;
        this.estadoPropuesta = EstadoArticulo.ARCHIVADO;
    }

    /**
     * Rechaza la versión propuesta.
     */
    public void rechazar() {
        this.estadoPropuesta = EstadoArticulo.RECHAZADO;
    }

    /**
     * Calcula la calificación promedio basada en los feedbacks.
     */
    public Double getCalificacionPromedio() {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return 0.0;
        }
        return feedbacks.stream()
                .filter(f -> f.getCalificacion() != null)
                .mapToInt(FeedbackArticulo::getCalificacion)
                .average()
                .orElse(0.0);
    }

    /**
     * Cuenta la cantidad de feedbacks útiles.
     */
    public long contarFeedbacksUtiles() {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return 0;
        }
        return feedbacks.stream()
                .filter(f -> Boolean.TRUE.equals(f.getUtil()))
                .count();
    }

    @PrePersist
    public void prePersist() {
        if (this.creadoEn == null) {
            this.creadoEn = LocalDateTime.now();
        }
        if (this.estadoPropuesta == null) {
            this.estadoPropuesta = EstadoArticulo.BORRADOR;
        }
        if (this.origen == null) {
            this.origen = OrigenVersion.MANUAL;
        }
        if (this.esVigente == null) {
            this.esVigente = false;
        }
    }
}
