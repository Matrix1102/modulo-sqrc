package com.sqrc.module.backendsqrc.plantillaRespuesta.Controller;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PlantillaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;


@RestController
@Deprecated
@RequestMapping("plantilla_respuesta")
@RequiredArgsConstructor
public class PlantillaController {

    private final PlantillaService plantillaService;


    @GetMapping
    public ResponseEntity<List<PlantillaResumenResponseDTO>> listarTodas() {
        // El servicio ya devuelve la lista de DTOs
        return ResponseEntity.ok(plantillaService.listarTodas());
    }


    @GetMapping("/por-caso/{caso}")
    public ResponseEntity<List<PlantillaResumenResponseDTO>> listarPorCaso(@PathVariable TipoCaso caso) {
        return ResponseEntity.ok(plantillaService.listarActivasPorCaso(caso));
    }



    @GetMapping("/resumen/{id}")
    public ResponseEntity<PlantillaResumenResponseDTO> obtenerResumenPorId(@PathVariable Long id) {
        return ResponseEntity.ok(plantillaService.obtenerPorIdResumen(id));
    }

    @GetMapping("/detalle/{id}")
    public ResponseEntity<PlantillaDetalleResponseDTO> obtenerDetallesPorId(@PathVariable Long id) {
        return ResponseEntity.ok(plantillaService.obtenerPorIdDetalle(id));
    }


    @PostMapping
    public ResponseEntity<PlantillaCreacionResponseDTO> crear(@RequestBody CrearPlantillaRequestDTO request) {
        // Pasamos el DTO directo al servicio
        return ResponseEntity.ok(plantillaService.crearPlantilla(request));
    }


    @PutMapping("/{id}")
    public ResponseEntity<PlantillaDetalleResponseDTO> actualizar(@PathVariable Long id,
                                                          @RequestBody ActualizarPlantillaRequestDTO request) {
        return ResponseEntity.ok(plantillaService.actualizarPlantilla(id, request));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        plantillaService.desactivarPlantilla(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivar")
    public ResponseEntity<Void> reactivar(@PathVariable Long id) {
        plantillaService.reactivarPlantilla(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/html-base")
    public ResponseEntity<Map<String, String>> obtenerHtmlBase() {
        String html = plantillaService.obtenerHtmlBase();

        // Esto crea un JSON: { "contenido": "<!DOCTYPE html>..." }
        return ResponseEntity.ok(Collections.singletonMap("contenido", html));
    }
}