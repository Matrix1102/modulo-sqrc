package com.sqrc.module.backendsqrc.plantillaRespuesta.DTO;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import org.springframework.stereotype.Component;

@Component
public class PlantillaMapper {

    // 1. De Entidad -> DTO Resumen (Listados)
    public PlantillaResumenResponseDTO toResumenDTO(Plantilla p) {
        return new PlantillaResumenResponseDTO(
                p.getIdPlantilla(),
                p.getNombre(),
                p.getTipoCaso(),
                Boolean.TRUE.equals(p.isActivo()),
                p.getFechaCreacion(),
                p.getFechaModificacion()
        );
    }

    // 2. De Entidad -> DTO Detalle (Ver/Editar)
    public PlantillaDetalleResponseDTO toDetalleDTO(Plantilla p) {
        return new PlantillaDetalleResponseDTO(
                p.getIdPlantilla(),
                p.getNombre(),
                p.getTituloVisible(),
                p.getTipoCaso(),
                p.getCuerpo(),
                p.getDespedida(),
                p.getHtmlModel()
        );
    }

    // 3. De DTO Crear -> Entidad
    public Plantilla toEntity(CrearPlantillaRequestDTO dto) {
        Plantilla p = new Plantilla();
        p.setNombre(dto.nombreInterno());
        p.setTituloVisible(dto.tituloVisible());
        p.setTipoCaso(dto.tipoCaso());
        p.setHtmlModel(dto.htmlModelo());
        p.setCuerpo(dto.cuerpo());
        p.setDespedida(dto.despedida());
        return p;
    }

    // 4. De DTO Actualizar -> Entidad
    public Plantilla toEntity(ActualizarPlantillaRequestDTO dto) {
        Plantilla p = new Plantilla();
        p.setNombre(dto.nombreInterno());
        p.setTituloVisible(dto.tituloVisible());
        p.setTipoCaso(dto.tipoCaso());
        p.setHtmlModel(dto.htmlModelo());
        p.setCuerpo(dto.cuerpo());
        p.setDespedida(dto.despedida());
        return p;
    }

    // 5. De Entidad -> DTO Creacion (Respuesta específica)
    public PlantillaCreacionResponseDTO toCreacionDTO(Plantilla p) {
        return new PlantillaCreacionResponseDTO(
                p.getIdPlantilla(),
                p.getNombre(),
                p.getTituloVisible(),
                p.getTipoCaso(),
                Boolean.TRUE.equals(p.isActivo()),
                p.getFechaCreacion(),
                p.getFechaModificacion(),
                p.getCuerpo(),
                p.getDespedida()
        );
    }
}