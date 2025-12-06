/**
 * Provider para compartir el estado del simulador de llamadas
 * entre diferentes componentes
 */
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useCallSimulator } from '../hooks/useCallSimulator';
import { useUser } from '../../../context/UserContext';
import { CallSimulatorContext } from './callSimulatorContext';

interface CallSimulatorProviderProps {
  children: ReactNode;
}

export function CallSimulatorProvider({ children }: CallSimulatorProviderProps) {
  const { user } = useUser();
  const location = useLocation();
  
  // Solo activar en la zona de agente de llamada y para rol AGENTE
  const isCallAgentPath = location.pathname.startsWith('/agente-llamada');
  const isCallAgentRole = user?.rol === 'AGENTE';
  const enableSimulator = isCallAgentPath && isCallAgentRole;
  
  const callSimulator = useCallSimulator({
    empleadoId: user?.id || 0,
    enabled: enableSimulator,
  });

  return (
    <CallSimulatorContext.Provider value={callSimulator}>
      {children}
    </CallSimulatorContext.Provider>
  );
}
