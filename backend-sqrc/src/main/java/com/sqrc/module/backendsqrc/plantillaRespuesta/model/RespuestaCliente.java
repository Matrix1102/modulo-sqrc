package com.sqrc.module.backendsqrc.plantillaRespuesta.model;


import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="respuestas")
@NoArgsConstructor //crea un constructor vacío
@AllArgsConstructor //crea un constructor con todos los argumentos
@Builder // Te permite crear objetos con patrón builder
@Getter //agrega todos los getters para cada atributo
@Setter //agrega todos los setters para cada atributo
public class RespuestaCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Long idRespuesta;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false)
    private Asignacion asignacion; //falta crear la clase Asignacion


    //relación con la tabla 'plantillas' (FK: plantilla_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plantilla_id", nullable = false)
    private Plantilla plantilla;


    @Column(name = "asunto", length = 300)
    private String asunto;


    @Column(name = "correo_destino", length = 255)
    private String correoDestino;


    @Lob
    @Column(name = "respuesta_html", columnDefinition = "TEXT")
    private String respuestaHtml;   // -> duda so es que se va usar


    @Lob
    @Column(name = "url_pdf_generado", columnDefinition = "TEXT")
    private String urlPdfGenerado;


    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;


    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
