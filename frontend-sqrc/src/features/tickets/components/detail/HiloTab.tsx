/**
 * Pestaña de Hilo del Ticket
 * Placeholder - Este componente será implementado por otro compañero
 */
import React from 'react';

export const HiloTab: React.FC = () => {
  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Hilo de Conversación</h3>
        <p className="text-gray-500">
          Esta sección está siendo implementada por otro miembro del equipo.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Aquí se mostrará el historial de comunicaciones y asignaciones del ticket.
        </p>
      </div>
    </div>
  );
};

export default HiloTab;
