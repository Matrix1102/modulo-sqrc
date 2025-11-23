package com.sqrc.module.backendsqrc.plantillaRespuesta.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="plantillas")
@NoArgsConstructor //crea un constructor vacío
@AllArgsConstructor //crea un constructor con todos los argumentos
@Builder // Te permite crear objetos con patrón builder
@Getter //agrega todos los getters para cada atributo
@Setter //agrega todos los setters para cada atributo
public class Plantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //para cuando el atributo es autoincrement en la bd
    @Column(name = "id_plantilla")
    private Long idPlantilla;


    @Column(name = "nombre_interno", length = 200)
    private String nombre;


    @Column(name = "titulo_visible", length = 200)
    private String tituloVisible;


    @Lob //para textos largos
    @Column(name = "cuerpo", columnDefinition = "TEXT")
    private String cuerpo;


    @Column(name = "despedida", length = 200)
    private String despedida;


    @Lob
    @Column(name = "html_model", columnDefinition = "TEXT")
    //aquí se guarda el esqueleto completo: <html>...{{CUERPO}}...</html>
    private String htmlModel;


    @Enumerated(EnumType.STRING)
    private TipoCaso tipoCaso;


    @Column(name = "activo")
    private Byte activo;


    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;


    public boolean renderizar(){

        System.out.println("renderizando");
        return true;
    }
}
