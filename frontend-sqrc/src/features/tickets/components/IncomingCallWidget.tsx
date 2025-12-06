/**
 * Widget de llamada entrante para agentes de llamada
 * - Se muestra en la parte inferior de la pantalla
 * - Puede moverse horizontalmente
 * - Muestra cronómetro cuando está en curso
 * - Permite aceptar/rechazar y finalizar llamadas
 */
import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Move, Clock } from 'lucide-react';
import type { LlamadaDto } from '../types';

interface IncomingCallWidgetProps {
  call: LlamadaDto | null;
  onAccept: () => void;
  onDecline: () => void;
  onFinalize: (duracionSegundos: number) => void;
  isActive: boolean;
}

export const IncomingCallWidget = ({
  call,
  onAccept,
  onDecline,
  onFinalize,
  isActive,
}: IncomingCallWidgetProps) => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const widgetRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const callIdRef = useRef<number | null>(null);

  // Reset timer when call changes
  if (call?.idLlamada !== callIdRef.current) {
    callIdRef.current = call?.idLlamada ?? null;
    if (elapsedSeconds !== 0) {
      setElapsedSeconds(0);
    }
  }

  // Cronómetro cuando la llamada está activa
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Manejo de arrastre horizontal
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && widgetRef.current) {
        const deltaX = e.clientX - dragStartX;
        const newX = position.x + deltaX;
        const maxX = window.innerWidth - widgetRef.current.offsetWidth;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
        });
        setDragStartX(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, position.x]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinalize = () => {
    onFinalize(elapsedSeconds);
  };

  if (!call) return null;

  return (
    <div
      ref={widgetRef}
      className={`fixed bottom-4 z-[9999] bg-white rounded-lg shadow-2xl border-2 transition-all ${
        !isActive ? 'border-green-500 animate-pulse' : 'border-blue-500'
      }`}
      style={{
        left: `${position.x}px`,
        width: '320px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header - Draggable */}
      <div
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move size={16} />
          <span className="font-semibold">
            {isActive ? 'Llamada en curso' : 'Llamada entrante'}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded">
            <Clock size={14} />
            <span className="text-sm font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Número de origen */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Número entrante</p>
          <p className="text-2xl font-bold text-gray-900">{call.numeroOrigen}</p>
        </div>

        {/* Botones de acción */}
        {!isActive ? (
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Phone size={20} />
              Aceptar
            </button>
            <button
              onClick={onDecline}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <PhoneOff size={20} />
              Rechazar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700">
                Llamada activa - Crea o asocia un ticket
              </p>
            </div>
            <button
              onClick={handleFinalize}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <PhoneOff size={20} />
              Finalizar llamada
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
