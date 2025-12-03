package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad principal que representa un artículo de la base de conocimientos.
 * Un artículo puede tener múltiples versiones, pero solo una versión vigente a
 * la vez.
 */
@Entity
@Table(name = "articulos", indexes = {
        @Index(name = "idx_articulo_codigo", columnList = "codigo", unique = true),
        @Index(name = "idx_articulo_etiqueta", columnList = "etiqueta"),
        @Index(name = "idx_articulo_visibilidad", columnList = "visibilidad"),
        @Index(name = "idx_articulo_vigencia", columnList = "vigente_desde, vigente_hasta")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Articulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_articulo")
    private Integer idArticulo;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "titulo", length = 255, nullable = false)
    private String titulo;

    @Column(name = "resumen", columnDefinition = "TEXT")
    private String resumen;

    @Enumerated(EnumType.STRING)
    @Column(name = "etiqueta", length = 20, nullable = false)
    private Etiqueta etiqueta;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_caso", length = 15)
    private TipoCaso tipoCaso;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibilidad", length = 15, nullable = false)
    private Visibilidad visibilidad;

    @Column(name = "vigente_desde")
    private LocalDateTime vigenteDesde;

    @Column(name = "vigente_hasta")
    private LocalDateTime vigenteHasta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", nullable = false)
    private Empleado propietario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ultimo_editor")
    private Empleado ultimoEditor;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "articulo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroVersion DESC")
    @Builder.Default
    private List<ArticuloVersion> versiones = new ArrayList<>();

    /**
     * Actualiza el resumen del artículo.
     */
    public void actualizarResumen(String nuevoResumen) {
        this.resumen = nuevoResumen;
        this.actualizadoEn = LocalDateTime.now();
    }

    /**
     * Cambia la etiqueta/categoría del artículo.
     */
    public void cambiarCategoria(Etiqueta nuevaEtiqueta) {
        this.etiqueta = nuevaEtiqueta;
        this.actualizadoEn = LocalDateTime.now();
    }

    /**
     * Crea una nueva versión del artículo y la añade a la lista de versiones.
     */
    public ArticuloVersion crearNuevaVersion(String contenido, String notaCambio, Empleado creador,
            OrigenVersion origen) {
        int siguienteNumero = this.versiones.isEmpty() ? 1
                : this.versiones.stream()
                        .mapToInt(ArticuloVersion::getNumeroVersion)
                        .max()
                        .orElse(0) + 1;

        ArticuloVersion nuevaVersion = ArticuloVersion.builder()
                .articulo(this)
                .numeroVersion(siguienteNumero)
                .contenido(contenido)
                .notaCambio(notaCambio)
                .creadoPor(creador)
                .creadoEn(LocalDateTime.now())
                .esVigente(false)
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(origen)
                .build();

        this.versiones.add(nuevaVersion);
        this.ultimoEditor = creador;
        this.actualizadoEn = LocalDateTime.now();

        return nuevaVersion;
    }

    /**
     * Verifica si el artículo está vigente en la fecha actual.
     */
    public boolean estaVigente() {
        LocalDateTime ahora = LocalDateTime.now();
        boolean desdeCumple = vigenteDesde == null || !ahora.isBefore(vigenteDesde);
        boolean hastaCumple = vigenteHasta == null || !ahora.isAfter(vigenteHasta);
        return desdeCumple && hastaCumple;
    }

    /**
     * Obtiene la versión vigente actual del artículo.
     */
    public ArticuloVersion getVersionVigente() {
        return versiones.stream()
                .filter(ArticuloVersion::getEsVigente)
                .findFirst()
                .orElse(null);
    }

    @PrePersist
    public void prePersist() {
        if (this.creadoEn == null) {
            this.creadoEn = LocalDateTime.now();
        }
        if (this.visibilidad == null) {
            this.visibilidad = Visibilidad.AGENTE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }
}
