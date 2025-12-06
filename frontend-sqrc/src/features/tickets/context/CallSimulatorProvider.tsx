/**
 * Provider para compartir el estado del simulador de llamadas
 * entre diferentes componentes
 */
import type { ReactNode } from 'react';
import { useCallSimulator } from '../hooks/useCallSimulator';
import { useUser } from '../../../context/UserContext';
import { CallSimulatorContext } from './callSimulatorContext';

interface CallSimulatorProviderProps {
  children: ReactNode;
}

export function CallSimulatorProvider({ children }: CallSimulatorProviderProps) {
  const { user } = useUser();
  
  // Solo activar para agentes de llamada (no para SUPERVISOR ni BACKOFFICE)
  const isCallAgent = user?.rol === "AGENTE";
  
  const callSimulator = useCallSimulator({
    empleadoId: user?.id || 6,
    enabled: isCallAgent,
  });

  return (
    <CallSimulatorContext.Provider value={callSimulator}>
      {children}
    </CallSimulatorContext.Provider>
  );
}
