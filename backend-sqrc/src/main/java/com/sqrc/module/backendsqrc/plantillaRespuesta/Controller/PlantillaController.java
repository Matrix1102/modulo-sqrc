package com.sqrc.module.backendsqrc.plantillaRespuesta.Controller;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PlantillaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso; // Ojo: Importa tu Enum correcto
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@Deprecated
@RequestMapping("/internal/plantillasres-deprecated") // deprecated: removed public API mapping to avoid conflict with /api/encuestas/plantillas
@RequiredArgsConstructor
public class PlantillaController {

    private final PlantillaService plantillaService;


    // 1.lista todas (Para la tabla de Admin)
    @GetMapping("/listarTodas")
    public ResponseEntity<List<PlantillaResponseDTO>> listarTodas() {
        List<Plantilla> entidades = plantillaService.listarTodas();

        // Convertimos la lista de Entidades a lista de DTOs
        List<PlantillaResponseDTO> dtos = entidades.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }


    // 2. LISTAR POR CASO (Para el Select: "Solo Reclamos")
    @GetMapping("/por-caso/{caso}")
    public ResponseEntity<List<PlantillaResponseDTO>> listarPorCaso(@PathVariable TipoCaso caso) {
        List<Plantilla> entidades = plantillaService.listarActivasPorCaso(caso);

        List<PlantillaResponseDTO> dtos = entidades.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }


    // 3. OBTENER UNA (Para cargar el formulario de Edición)
    @GetMapping("/{id}")
    public ResponseEntity<PlantillaResponseDTO> obtenerPorId(@PathVariable Long id) {
        Plantilla entidad = plantillaService.obtenerPorId(id);
        return ResponseEntity.ok(mapToDTO(entidad));
    }


    // 4. CREAR NUEVA
    @PostMapping
    public ResponseEntity<PlantillaResponseDTO> crear(@RequestBody CrearPlantillaRequestDTO request) {
        // Convertimos DTO -> Entidad manualmente (o usarías un Mapper)
        Plantilla nueva = new Plantilla();
        nueva.setNombre(request.nombreInterno());
        nueva.setTituloVisible(request.tituloVisible());
        nueva.setTipoCaso(request.tipoCaso()); // Asegúrate que el Enum coincida
        nueva.setHtmlModel(request.htmlModelo());
        nueva.setCuerpo(request.cuerpo());
        nueva.setDespedida(request.despedida());

        // El servicio se encarga de poner fecha, activo=true, etc.
        Plantilla guardada = plantillaService.crearPlantilla(nueva);

        return ResponseEntity.ok(mapToDTO(guardada));
    }


    // 5. ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<PlantillaResponseDTO> actualizar(@PathVariable Long id,
                                                           @RequestBody ActualizarPlantillaRequestDTO request) {
        // Mapeamos los datos nuevos
        Plantilla datosNuevos = new Plantilla();
        datosNuevos.setNombre(request.nombreInterno());
        datosNuevos.setTituloVisible(request.tituloVisible());
        datosNuevos.setTipoCaso(request.tipoCaso());
        datosNuevos.setHtmlModel(request.htmlModelo());
        datosNuevos.setCuerpo(request.cuerpo());
        datosNuevos.setDespedida(request.despedida());

        // Llamamos al servicio (él valida nombres duplicados)
        Plantilla actualizada = plantillaService.actualizarPlantilla(id, datosNuevos);

        return ResponseEntity.ok(mapToDTO(actualizada));
    }


    // 6. ELIMINAR (Borrado Lógico)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        plantillaService.desactivarPlantilla(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content
    }


    //Convierte Entidad -> DTO
    private PlantillaResponseDTO mapToDTO(Plantilla p) {
        return new PlantillaResponseDTO(
                p.getIdPlantilla(),
                p.getNombre(),
                p.getTituloVisible(),
                p.getTipoCaso(),         // Enum
                p.isActivo(),  // Convertimos Byte/TinyInt a boolean (si tu BD usa 1/0)
                p.getFechaCreacion(),
                p.getFechaModificacion(),
                p.getCuerpo(),
                p.getDespedida()
        );
    }
}