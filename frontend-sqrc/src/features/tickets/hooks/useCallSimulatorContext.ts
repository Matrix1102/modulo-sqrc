/**
 * Hook para acceder al contexto del simulador de llamadas
 */
import { useContext } from 'react';
import { CallSimulatorContext, type CallSimulatorContextType } from '../context/callSimulatorContext';

export function useCallSimulatorContext(): CallSimulatorContextType | null {
  const context = useContext(CallSimulatorContext);
  return context;
}
