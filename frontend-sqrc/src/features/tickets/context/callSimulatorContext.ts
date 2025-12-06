/**
 * Definición del Context para el simulador de llamadas
 */
import { createContext } from 'react';
import type { LlamadaDto } from '../types';

export interface CallSimulatorContextType {
  currentCall: LlamadaDto | null;
  isActive: boolean;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  finalizeCall: (duracionSegundos: number) => Promise<void>;
}

export const CallSimulatorContext = createContext<CallSimulatorContextType | null>(null);
