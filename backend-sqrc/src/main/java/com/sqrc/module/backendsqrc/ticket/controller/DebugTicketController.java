package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Agente;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugTicketController {

    private final AsignacionRepository asignacionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TicketRepository ticketRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/tickets/{ticketId}/resolved-agent")
    public ResponseEntity<?> getResolvedAgent(@PathVariable Long ticketId) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("ticketId", ticketId);

        try {
            Optional<Asignacion> ultimaOpt = asignacionRepository.findTopByTicket_IdTicketOrderByFechaInicioDesc(ticketId);
            if (ultimaOpt.isPresent()) {
                Asignacion ultima = ultimaOpt.get();
                resp.put("asignacionId", ultima.getIdAsignacion());
                Long empId = ultima.getEmpleado() != null ? ultima.getEmpleado().getIdEmpleado() : null;
                resp.put("empleadoId", empId);

                if (empId != null) {
                    Optional<Empleado> empOpt = empleadoRepository.findById(empId);
                    if (empOpt.isPresent()) {
                        Empleado e = empOpt.get();
                        resp.put("empleadoNombre", e.getNombre() + " " + e.getApellido());
                        resp.put("empleadoCorreo", e.getCorreo());
                        resp.put("empleadoTipo", e.getTipoEmpleado());
                        resp.put("empleadoClass", e.getClass().getName());

                        boolean isAgente = e instanceof Agente;
                        String resolvedBy = "repository";

                        // Si la instancia no es Agente, intentar cargar el subtipo directamente
                        if (!isAgente && empId != null) {
                            try {
                                Agente agenteFromEM = entityManager.find(Agente.class, empId);
                                if (agenteFromEM != null) {
                                    isAgente = true;
                                    resp.put("agenteId", agenteFromEM.getIdEmpleado());
                                    resolvedBy = "entityManager";
                                    resp.put("empleadoClass_afterEntityManager", agenteFromEM.getClass().getName());
                                }
                            } catch (Exception findEx) {
                                resp.put("entityManagerError", findEx.getMessage());
                            }
                        } else if (isAgente) {
                            resp.put("agenteId", e.getIdEmpleado());
                        }

                        resp.put("isAgente", isAgente);
                        resp.put("resolvedBy", resolvedBy);
                    } else {
                        resp.put("empleadoFound", false);
                    }
                }
            } else {
                resp.put("asignacion", "not_found");
            }
        } catch (Exception ex) {
            resp.put("error", ex.getMessage());
        }

        return ResponseEntity.ok(resp);
    }
}
