package com.sqrc.module.backendsqrc.encuesta.listener;

import com.sqrc.module.backendsqrc.encuesta.event.EncuestaRespondidaEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AlertaSupervisorListener {

    /**
     * Este método "escucha" automáticamente cuando alguien lanza un EncuestaRespondidaEvent.
     * @Async permite que esto corra en otro hilo para no hacer esperar al cliente.
     * (Nota: Para que @Async funcione real, debes tener @EnableAsync en tu Application principal, 
     * si no, correrá en el mismo hilo, lo cual también es válido).
     */
    @EventListener
    public void gestionarAlertaCalidad(EncuestaRespondidaEvent event) {
        System.out.println(">>> [OBSERVER] Evento recibido: Encuesta ID " + event.getIdEncuesta());

        if (event.isEsCritica()) {
            // AQUÍ SE APLICA EL PATRÓN: Reacción desacoplada ante un evento crítico
            System.out.println("!!! ALERTA DE CALIDAD DETECTADA !!!");
            System.out.println("El cliente ha dejado una calificación negativa en la encuesta: " + event.getIdEncuesta());
            System.out.println("Acción: Generando notificación urgente al Supervisor...");
            
            // Aquí conectarías con tu EmailService si quisieras enviar un correo real
            // emailService.enviarAlerta("supervisor@sqrc.com", "Cliente Insatisfecho", "Revisar encuesta " + event.getIdEncuesta());
        } else {
            System.out.println(">>> [OBSERVER] La encuesta tiene calificación positiva. No se requieren acciones inmediatas.");
        }
    }
}