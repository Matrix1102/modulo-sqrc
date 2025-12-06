/**
 * SimuladorAreaExterna - Página del simulador para áreas externas
 * 
 * Simula el sistema de un área externa que recibe derivaciones del CRM
 * Permite ver tickets derivados y responder a ellos
 */

import { useState, useEffect } from 'react';
import { Building2, RefreshCw, AlertCircle, Inbox, Filter } from 'lucide-react';
import DerivacionCard from '../../features/simulador/components/DerivacionCard';
import { obtenerTicketsDerivados } from '../../features/simulador/services/simuladorApi';
import showNotification from '../../services/notification';
import type { TicketDerivadoSimuladorDTO } from '../../features/simulador/types';
import { AREAS_MAP } from '../../features/simulador/types';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function SimuladorAreaExterna() {
  const [tickets, setTickets] = useState<TicketDerivadoSimuladorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState<number | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const cargarTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerTicketsDerivados();
      console.log('Tickets cargados desde API:', data);
      setTickets(data);
    } catch (error: any) {
      console.error('Error al cargar tickets derivados:', error);
      const errorMsg = error.response?.data?.message || 'No se pudieron cargar los tickets derivados';
      setError(errorMsg);
      showNotification(
        `❌ Error al cargar tickets: ${errorMsg}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
    
    // Log para debug
    return () => {
      console.log('SimuladorAreaExterna unmounting');
    };
  }, []);

  // Logging de cambios en tickets para debug
  useEffect(() => {
    console.log('Tickets actualizados:', tickets.length);
    if (tickets.length > 0) {
      console.log('Primer ticket:', tickets[0]);
    }
  }, [tickets]);

  // Filtrar tickets por área
  const ticketsFiltrados = tickets.filter((ticket) => {
    if (areaFilter === 'all') return true;
    return ticket.notificacion?.areaDestinoId === areaFilter;
  });

  // Separar tickets respondidos y pendientes
  const ticketsPendientes = ticketsFiltrados.filter((t) => !t.notificacion?.respuesta);
  const ticketsRespondidos = ticketsFiltrados.filter((t) => t.notificacion?.respuesta);

  // Obtener IDs únicos de áreas presentes en los tickets
  const areasPresentes = Array.from(
    new Set(
      tickets
        .filter(t => t.notificacion?.areaDestinoId != null)
        .map((t) => t.notificacion!.areaDestinoId)
    )
  ).sort((a, b) => a - b);

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🏢 Simulador - Sistema de Área Externa
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Bandeja de entrada de derivaciones del CRM SQRC
                </p>
              </div>
            </div>
            <button
              onClick={cargarTickets}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filtrar por área:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAreaFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  areaFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({tickets.length})
              </button>
              {areasPresentes.map((areaId) => {
                const count = tickets.filter((t) => t.notificacion?.areaDestinoId === areaId).length;
                return (
                  <button
                    key={areaId}
                    onClick={() => setAreaFilter(areaId)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      areaFilter === areaId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {AREAS_MAP[areaId] || `Área #${areaId}`} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando tickets derivados...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay tickets derivados
            </h3>
            <p className="text-gray-600">
              Cuando el BackOffice derive tickets a áreas externas, aparecerán aquí.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar los tickets
            </h3>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <button
              onClick={cargarTickets}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tickets List */}
        {!loading && ticketsFiltrados.length > 0 && (
          <div className="space-y-8">
            {/* Tickets Pendientes */}
            {ticketsPendientes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Pendientes de Respuesta ({ticketsPendientes.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {ticketsPendientes.map((ticket) => (
                    <DerivacionCard
                      key={ticket.idTicket}
                      ticket={ticket}
                      onRespuestaRegistrada={cargarTickets}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Tickets Respondidos */}
            {ticketsRespondidos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Ya Respondidos ({ticketsRespondidos.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {ticketsRespondidos.map((ticket) => (
                    <DerivacionCard
                      key={ticket.idTicket}
                      ticket={ticket}
                      onRespuestaRegistrada={cargarTickets}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No Results After Filter */}
        {!loading && tickets.length > 0 && ticketsFiltrados.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay tickets para esta área
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta cambiar el filtro o selecciona "Todas" para ver todos los tickets.
            </p>
            <button
              onClick={() => setAreaFilter('all')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Todos
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            🔧 <strong>Simulador de Área Externa</strong> - Sistema de prueba para derivaciones del CRM SQRC
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            Este módulo simula cómo las áreas externas recibirían y responderían derivaciones
          </p>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
