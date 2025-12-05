/**
 * Layout para la vista de detalle del ticket
 * Estructura de dos paneles:
 * - Panel izquierdo: Info del ticket y cliente (siempre visible)
 * - Panel derecho: Tabs (Detalles, Documentación, Hilo)
 */
import React from 'react';
import type { TicketDetail, EstadoTicket, TipoTicket } from '../../types';
import { ESTADO_CONFIG, TIPO_CONFIG } from '../../types';

export type TicketTabKey = 'detalles' | 'documentacion' | 'hilo';

interface TicketDetailLayoutProps {
  ticket: TicketDetail;
  activeTab: TicketTabKey;
  onTabChange: (tab: TicketTabKey) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const EstadoSelect: React.FC<{ estado: EstadoTicket }> = ({ estado }) => {
  const config = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
};

const TipoSelect: React.FC<{ tipo: TipoTicket }> = ({ tipo }) => {
  const config = TIPO_CONFIG[tipo];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
};

// Panel izquierdo: Info del Ticket y Cliente
const TicketInfoPanel: React.FC<{ ticket: TicketDetail }> = ({ ticket }) => {
  const formatTicketId = (id: number) => `#TC-${id.toString().padStart(4, '0')}`;
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const cliente = ticket.cliente;

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
      {/* Header del Ticket */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{ticket.asunto}</h1>
        <span className="text-gray-500 text-sm">{formatTicketId(ticket.idTicket)}</span>
        
        {/* Estado y Tipo */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Estado:</span>
            <EstadoSelect estado={ticket.estado} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Tipo:</span>
            <TipoSelect tipo={ticket.tipoTicket} />
          </div>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Información del Cliente
        </h2>
        
        {cliente ? (
          <div className="space-y-4">
            {/* Header del cliente */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {cliente.nombre || ''} {cliente.apellido || ''}
                </p>
                <p className="text-sm text-gray-500">Cliente ID: {cliente.idCliente}</p>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">DNI:</span>
                <span className="text-sm font-medium text-gray-900">{cliente.dni || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Fecha Nacimiento:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(cliente.fechaNacimiento)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Correo:</span>
                <span className="text-sm font-medium text-blue-600 truncate max-w-[180px]">
                  {cliente.correo || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Teléfono:</span>
                <span className="text-sm font-medium text-gray-900">{cliente.telefono || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Celular:</span>
                <span className="text-sm font-medium text-gray-900">{cliente.celular || '-'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm">Sin información de cliente</p>
          </div>
        )}
      </div>

      {/* Info adicional del ticket - REMOVIDO, ahora va en DetallesTab */}
    </div>
  );
};

export const TicketDetailLayout: React.FC<TicketDetailLayoutProps> = ({
  ticket,
  activeTab,
  onTabChange,
  children,
  actions,
}) => {
  const tabs: { key: TicketTabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'detalles',
      label: 'Detalles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      key: 'documentacion',
      label: 'Documentación',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'hilo',
      label: 'Hilo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex bg-gray-50">
      {/* Panel Izquierdo - Info del Ticket y Cliente (siempre visible) */}
      <div className="w-96 shrink-0">
        <TicketInfoPanel ticket={ticket} />
      </div>

      {/* Panel Derecho - Tabs y contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {/* 2. ✅ AQUÍ RENDERIZAS EL BOTÓN (A la derecha) */}
          <div className="ml-4">
            {actions}
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailLayout;
