package com.sqrc.module.backendsqrc.encuesta.model;

// import com.sqrc.module.backendsqrc.ticket.model.Ticket; // TODO: Descomentar cuando exista
// import com.sqrc.module.backendsqrc.usuario.model.Agente; // TODO: Descomentar cuando exista
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "encuestas_ejecucion")
public class Encuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEncuesta;

    // 1. Relación con el Diseño (¿Qué preguntas tiene?)
    @ManyToOne
    @JoinColumn(name = "plantilla_id", nullable = false)
    private PlantillaEncuesta plantilla;

    // 2. Relación con el Contexto (¿Por qué se envía?)
    // TODO: Descomentar cuando la clase Ticket exista
    // @OneToOne
    // @JoinColumn(name = "ticket_id", nullable = false)
    // private Ticket ticket;

    // 3. Metadatos del Diagrama
    @Enumerated(EnumType.STRING)
    private AlcanceEvaluacion alcanceEvaluacion; // SOLICITUD, ATENCION...

    @Enumerated(EnumType.STRING)
    private EstadoEncuesta estadoEncuesta; // ENVIADA, RESPONDIDA...

    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaExpiracion;

    // Reenvíos tracking
    @Column(name = "resend_count")
    private Integer resendCount;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    @Column(name = "last_sent_by")
    private Long lastSentBy;

    // 4. Relación con la Respuesta (Inicialmente null, se llena cuando el cliente responde)
    @OneToOne(mappedBy = "encuesta", cascade = CascadeType.ALL)
    private RespuestaEncuesta respuestaEncuesta;

    // Métodos útiles
    @PrePersist
    public void prePersist() {
        if (this.fechaEnvio == null) this.fechaEnvio = LocalDateTime.now();
        if (this.estadoEncuesta == null) this.estadoEncuesta = EstadoEncuesta.ENVIADA;
        if (this.resendCount == null) this.resendCount = 0;
    }
}