/**
 * Hook para simular llamadas entrantes para agentes de llamada
 * - Primera llamada a los 10 segundos
 * - Llamadas subsecuentes cada 30-60 segundos (aleatorio)
 * - Genera números telefónicos peruanos simulados
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { crearLlamada, cambiarEstadoLlamada, finalizarLlamada } from '../services/llamadaApi';
import type { LlamadaDto } from '../types';
import notification from '../../../services/notification';

interface UseCallSimulatorOptions {
  empleadoId: number;
  enabled: boolean;
  initialDelay?: number; // milisegundos para la primera llamada
  minDelay?: number; // mínimo entre llamadas
  maxDelay?: number; // máximo entre llamadas
}

interface CallSimulatorState {
  currentCall: LlamadaDto | null;
  isActive: boolean; // true cuando la llamada fue aceptada
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  finalizeCall: (duracionSegundos: number) => Promise<void>;
}

const generatePeruvianPhoneNumber = (): string => {
  // Genera número peruano: +51 9XX XXX XXX
  const prefix = '+51 9';
  const firstPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const secondPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const thirdPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${firstPart} ${secondPart} ${thirdPart}`;
};

export const useCallSimulator = ({
  empleadoId,
  enabled,
  initialDelay = 10000, // 10 segundos por defecto
  minDelay = 30000, // 30 segundos
  maxDelay = 60000, // 60 segundos
}: UseCallSimulatorOptions): CallSimulatorState => {
  const [currentCall, setCurrentCall] = useState<LlamadaDto | null>(null);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isFirstCall = useRef(true);
  const enabledRef = useRef(enabled);
  const empleadoIdRef = useRef(empleadoId);

  // Actualizar refs
  useEffect(() => {
    enabledRef.current = enabled;
    empleadoIdRef.current = empleadoId;
  }, [enabled, empleadoId]);

  // Función para generar una nueva llamada
  const generateNewCall = useCallback(async () => {
    // No crear nueva llamada si:
    // 1. El simulador está deshabilitado
    // 2. Ya hay una llamada en curso (currentCall existe)
    // 3. Hay una llamada activa (isActive = true)
    if (!enabledRef.current || currentCall || isActive) {
      console.log('No se genera nueva llamada - Estado actual:', { 
        enabled: enabledRef.current, 
        tieneCallActual: !!currentCall, 
        estaActiva: isActive 
      });
      return;
    }

    try {
      const numeroOrigen = generatePeruvianPhoneNumber();
      const nuevaLlamada = await crearLlamada({
        empleadoId: empleadoIdRef.current,
        numeroOrigen,
        // No establecer estado aquí, el backend lo maneja
      });

      setCurrentCall(nuevaLlamada);
      
      // Reproducir sonido de llamada (opcional)
      try {
        const audio = new Audio('/sounds/phone-ring.mp3');
        audio.loop = true;
        audio.play().catch(() => {
          // Ignorar si el navegador bloquea el audio o no existe el archivo
        });

        // Detener sonido cuando se acepta o rechaza
        const stopAudio = () => audio.pause();
        window.addEventListener('call-answered', stopAudio, { once: true });
      } catch {
        // Ignorar errores de audio
      }

    } catch (error) {
      console.error('Error al generar llamada simulada:', error);
    }
  }, [currentCall, isActive]);

  // Programar siguiente llamada
  const scheduleNextCall = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!enabledRef.current) return;

    const delay = isFirstCall.current
      ? initialDelay
      : minDelay + Math.random() * (maxDelay - minDelay);

    timeoutRef.current = window.setTimeout(() => {
      isFirstCall.current = false;
      generateNewCall();
    }, delay);
  }, [initialDelay, minDelay, maxDelay, generateNewCall]);

  // Iniciar simulador
  useEffect(() => {
    if (enabled && !currentCall && !isActive) {
      scheduleNextCall();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, currentCall, isActive, scheduleNextCall]);

  // Aceptar llamada
  const acceptCall = useCallback(async () => {
    if (!currentCall) return;

    try {
      await cambiarEstadoLlamada(currentCall.idLlamada, 'ACEPTADA');
      setIsActive(true);
      window.dispatchEvent(new Event('call-answered'));
      notification('Llamada aceptada - Puedes crear o asociar un ticket', 'success');
    } catch (error) {
      notification('Error: No se pudo aceptar la llamada', 'error');
      console.error('Error al aceptar llamada:', error);
    }
  }, [currentCall]);

  // Rechazar llamada
  const declineCall = useCallback(async () => {
    if (!currentCall) return;

    try {
      await cambiarEstadoLlamada(currentCall.idLlamada, 'DECLINADA');
      window.dispatchEvent(new Event('call-answered'));
      notification('Llamada rechazada', 'info');
      setCurrentCall(null);
      setIsActive(false);
      scheduleNextCall();
    } catch (error) {
      notification('Error: No se pudo rechazar la llamada', 'error');
      console.error('Error al rechazar llamada:', error);
    }
  }, [currentCall, scheduleNextCall]);

  // Finalizar llamada
  const finalizeCall = useCallback(
    async (duracionSegundos: number) => {
      if (!currentCall) return;

      try {
        await finalizarLlamada(currentCall.idLlamada, duracionSegundos);
        const mins = Math.floor(duracionSegundos / 60);
        const secs = duracionSegundos % 60;
        notification(
          `Llamada finalizada - Duración: ${mins}:${secs.toString().padStart(2, '0')}`,
          'success'
        );
        setCurrentCall(null);
        setIsActive(false);
        scheduleNextCall();
      } catch (error) {
        notification('Error: No se pudo finalizar la llamada', 'error');
        console.error('Error al finalizar llamada:', error);
      }
    },
    [currentCall, scheduleNextCall]
  );

  return {
    currentCall,
    isActive,
    acceptCall,
    declineCall,
    finalizeCall,
  };
};
