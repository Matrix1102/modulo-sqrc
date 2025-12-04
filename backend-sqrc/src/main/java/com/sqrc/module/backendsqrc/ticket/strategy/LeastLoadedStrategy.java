package com.sqrc.module.backendsqrc.ticket.strategy;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Component("leastLoaded")
@RequiredArgsConstructor // <--- Inyección automática del repositorio
public class LeastLoadedStrategy implements AssignmentStrategy {

    private final EmpleadoRepository empleadoRepository;

    @Override
    public Long findBestAgentId(String areaDestino) {
        System.out.println("🤖 [STRATEGY] Consultando BD para área: " + areaDestino);

        // 1. Buscar empleados reales en la BD
        List<Empleado> agentesDisponibles = empleadoRepository.findByArea(areaDestino);

        // Validación de seguridad
        if (agentesDisponibles.isEmpty()) {
            throw new RuntimeException("No hay empleados disponibles en el área: " + areaDestino);
        }

        // 2. (Aquí iría la lógica de contar cargas, por ahora elegimos al azar de los reales)
        // Esto soluciona tu error de "ID 30 no existe", porque solo elegimos de los que SÍ existen.
        Empleado elegido = agentesDisponibles.get(new Random().nextInt(agentesDisponibles.size()));

        System.out.println("✅ [STRATEGY] Agente real seleccionado: " + elegido.getNombre() + " (ID: " + elegido.getIdEmpleado() + ")");
        return elegido.getIdEmpleado();
    }
}