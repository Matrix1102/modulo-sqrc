/**
 * Hook para acceder al contexto del simulador de llamadas
 */
import { useContext } from 'react';
import { CallSimulatorContext, type CallSimulatorContextType } from '../context/callSimulatorContext';

export function useCallSimulatorContext(): CallSimulatorContextType {
  const context = useContext(CallSimulatorContext);
  if (!context) {
    throw new Error('useCallSimulatorContext debe usarse dentro de CallSimulatorProvider');
  }
  return context;
}
