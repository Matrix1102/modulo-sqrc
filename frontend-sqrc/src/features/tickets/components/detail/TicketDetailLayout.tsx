/**
 * Layout para la vista de detalle del ticket
 * Similar a Customer360Layout pero para tickets
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

// Componente de tarjeta de cliente - siempre visible
const ClienteCard: React.FC<{ cliente: TicketDetail['cliente'] }> = ({ cliente }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header del cliente */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {cliente.nombre} {cliente.apellido}
          </h2>
          <p className="text-sm text-gray-500">ID: {cliente.idCliente}</p>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="space-y-4">
        <div className="flex items-center border-b border-gray-100 pb-3">
          <span className="w-40 text-sm text-gray-500">DNI:</span>
          <span className="text-sm text-blue-600 font-medium">{cliente.dni}</span>
        </div>
        <div className="flex items-center border-b border-gray-100 pb-3">
          <span className="w-40 text-sm text-gray-500">Fecha de Nacimiento:</span>
          <span className="text-sm text-blue-600 font-medium">
            {formatDate(cliente.fechaNacimiento)}
          </span>
        </div>
        <div className="flex items-center border-b border-gray-100 pb-3">
          <span className="w-40 text-sm text-gray-500">Correo:</span>
          <span className="text-sm text-blue-600 font-medium">{cliente.correo}</span>
        </div>
        <div className="flex items-center border-b border-gray-100 pb-3">
          <span className="w-40 text-sm text-gray-500">Teléfono:</span>
          <span className="text-sm text-blue-600 font-medium">{cliente.telefono || '-'}</span>
        </div>
        <div className="flex items-center">
          <span className="w-40 text-sm text-gray-500">Celular:</span>
          <span className="text-sm text-blue-600 font-medium">{cliente.celular}</span>
        </div>
      </div>
    </div>
  );
};

export const TicketDetailLayout: React.FC<TicketDetailLayoutProps> = ({
  ticket,
  activeTab,
  onTabChange,
  children,
}) => {
  const formatTicketId = (id: number) => `#TC-${id.toString().padStart(4, '0')}`;

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header con título y pestañas */}
      <div className="bg-white border-b border-gray-200">
        {/* Título del ticket */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Título del Ticket</h1>
            <span className="text-gray-400 text-lg">{formatTicketId(ticket.idTicket)}</span>
          </div>

          {/* Tabs */}
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
        </div>

        {/* Estado y Tipo */}
        <div className="px-6 pb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 uppercase">Estado:</span>
            <EstadoSelect estado={ticket.estado} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 uppercase">Tipo:</span>
            <TipoSelect tipo={ticket.tipoTicket} />
          </div>
        </div>
      </div>

      {/* Content Area - Cliente siempre visible + tabs content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Tarjeta del cliente - siempre visible */}
          <ClienteCard cliente={ticket.cliente} />

          {/* Contenido del tab activo */}
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailLayout;
