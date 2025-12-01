import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, FileText, User } from "lucide-react";
import {
  STATUS_BADGE_VARIANTS,
  formatDate,
  formatDateTime,
} from "./helpers";
import { getTicketHistory, type TicketHistoryResponse } from "../../../../services/vista360Api";

export interface TicketDetailViewerProps {
  ticketId: number | null;
}

const TicketDetailViewer: React.FC<TicketDetailViewerProps> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<TicketHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      return;
    }

    const loadTicket = async () => {
      setIsLoading(true);
      try {
        const data = await getTicketHistory(ticketId);
        setTicket(data);
      } catch (error) {
        console.error('Error loading ticket history:', error);
        setTicket(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  const toggleAssignment = (id: number) => {
    setExpandedAssignments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl bg-gray-100 p-6">
        <div className="animate-pulse text-sm font-medium text-gray-600">
          Cargando información del ticket...
        </div>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl bg-gray-100 p-6 text-sm text-gray-500">
        Selecciona un ticket para visualizar el detalle completo.
      </section>
    );
  }

  // Mapeo de estados en español
  const estadosMap: Record<string, string> = {
    ABIERTO: "Abierto",
    ESCALADO: "Escalado",
    DERIVADO: "Derivado",
    AUDITORIA: "Auditoría",
    CERRADO: "Cerrado",
  };

  const estadoEsp = estadosMap[ticket.estado] || ticket.estado;

  // Determinar prioridad basada en tipo
  const getPriority = () => {
    switch (ticket.tipoTicket) {
      case 'RECLAMO': return 'Alta';
      case 'QUEJA': return 'Media';
      default: return 'Baja';
    }
  };

  return (
    <section className="flex h-full flex-col gap-5 overflow-y-auto rounded-xl bg-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{ticket.titulo}</h2>
          <p className="text-sm text-gray-500">Motivo: {ticket.motivo}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_VARIANTS[estadoEsp as keyof typeof STATUS_BADGE_VARIANTS]}`}
        >
          {estadoEsp}
        </span>
      </header>

      {/* Descripción */}
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Descripción</h3>
        <p className="mt-2 text-sm text-gray-700">{ticket.descripcion}</p>
      </article>

      {/* Información General */}
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Información general</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{ticket.tipoTicket}</dd>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Canal</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{ticket.origen}</dd>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prioridad</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{getPriority()}</dd>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Creación</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{formatDate(new Date(ticket.fechaCreacion))}</dd>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cierre</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">
              {ticket.fechaCierre ? formatDate(new Date(ticket.fechaCierre)) : "Aún abierto"}
            </dd>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente ID</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{ticket.clienteId || "N/A"}</dd>
          </div>
        </dl>
      </article>

      {/* Información Específica por Tipo */}
      {ticket.consultaInfo && (
        <article className="rounded-xl bg-blue-50 border border-blue-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900">Información de Consulta</h3>
          <div className="mt-2 text-sm text-blue-800">
            <strong>Tema:</strong> {ticket.consultaInfo.tema}
          </div>
        </article>
      )}

      {ticket.quejaInfo && (
        <article className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-900">Información de Queja</h3>
          <div className="mt-2 space-y-1 text-sm text-amber-800">
            <div><strong>Impacto:</strong> {ticket.quejaInfo.impacto}</div>
            <div><strong>Área Involucrada:</strong> {ticket.quejaInfo.areaInvolucrada}</div>
          </div>
        </article>
      )}

      {ticket.solicitudInfo && (
        <article className="rounded-xl bg-green-50 border border-green-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-green-900">Información de Solicitud</h3>
          <div className="mt-2 text-sm text-green-800">
            <strong>Tipo de Solicitud:</strong> {ticket.solicitudInfo.tipoSolicitud}
          </div>
        </article>
      )}

      {ticket.reclamoInfo && (
        <article className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-red-900">Información de Reclamo</h3>
          <div className="mt-2 space-y-1 text-sm text-red-800">
            <div><strong>Motivo:</strong> {ticket.reclamoInfo.motivoReclamo}</div>
            <div><strong>Límite Respuesta:</strong> {formatDate(new Date(ticket.reclamoInfo.fechaLimiteRespuesta))}</div>
            <div><strong>Límite Resolución:</strong> {formatDate(new Date(ticket.reclamoInfo.fechaLimiteResolucion))}</div>
            <div><strong>Resultado:</strong> {ticket.reclamoInfo.resultado || "Pendiente"}</div>
          </div>
        </article>
      )}

      {/* Historial de Asignaciones */}
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Historial de Asignaciones ({ticket.asignaciones.length})
        </h3>

        {ticket.asignaciones.length === 0 ? (
          <p className="text-sm text-gray-500">No hay asignaciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {ticket.asignaciones.map((asignacion, index) => {
              const isExpanded = expandedAssignments.has(asignacion.idAsignacion);
              const isActive = asignacion.fechaFin === null;
              
              return (
                <div
                  key={asignacion.idAsignacion}
                  className={`rounded-lg border ${isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} p-3`}
                >
                  {/* Header de Asignación */}
                  <button
                    onClick={() => toggleAssignment(asignacion.idAsignacion)}
                    className="flex w-full items-start justify-between gap-2 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          #{index + 1} - {asignacion.tipo}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            En Curso
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {asignacion.empleado ? `${asignacion.empleado.nombre} ${asignacion.empleado.apellido}` : "Sin asignar"} | {asignacion.area}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(new Date(asignacion.fechaInicio))} - {asignacion.fechaFin ? formatDateTime(new Date(asignacion.fechaFin)) : "Actual"}
                      </p>
                    </div>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  {/* Contenido Expandido */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                      <div className="text-sm">
                        <strong className="text-gray-700">Motivo de Desplazamiento:</strong>
                        <p className="text-gray-600 mt-1">{asignacion.motivoDesplazamiento}</p>
                      </div>

                      {/* Empleado Expandible */}
                      {asignacion.empleado && (
                        <details className="rounded-lg border border-gray-200 bg-white p-3">
                          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-900">
                            <User size={16} />
                            Información del Empleado
                          </summary>
                          <div className="mt-2 space-y-1 text-xs text-gray-700">
                            <div><strong>Nombre:</strong> {asignacion.empleado.nombre} {asignacion.empleado.apellido}</div>
                            <div><strong>Cargo:</strong> {asignacion.empleado.cargo}</div>
                            <div><strong>Área:</strong> {asignacion.empleado.area}</div>
                            <div><strong>ID:</strong> {asignacion.empleado.idEmpleado}</div>
                          </div>
                        </details>
                      )}

                      {/* Documentación Expandible */}
                      {asignacion.documentacion && (
                        <details className="rounded-lg border border-gray-200 bg-white p-3">
                          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-900">
                            <FileText size={16} />
                            Documentación
                          </summary>
                          <div className="mt-2 space-y-2 text-xs text-gray-700">
                            <div>
                              <strong>Problema:</strong>
                              <p className="mt-1">{asignacion.documentacion.problema}</p>
                            </div>
                            <div>
                              <strong>Solución:</strong>
                              <p className="mt-1">{asignacion.documentacion.articulo}</p>
                            </div>
                            <div>
                              <strong>Fecha Creación:</strong> {formatDateTime(new Date(asignacion.documentacion.fechaCreacion))}
                            </div>
                            {asignacion.documentacion.autor && (
                              <div>
                                <strong>Autor:</strong> {asignacion.documentacion.autor.nombre} {asignacion.documentacion.autor.apellido}
                              </div>
                            )}
                            {asignacion.documentacion.articuloKB && (
                              <div className="mt-2 rounded-md bg-blue-50 border border-blue-200 p-2">
                                <strong className="text-blue-900">Artículo KB:</strong>
                                <div className="text-blue-800 mt-1">
                                  <div>ID: {asignacion.documentacion.articuloKB.idArticuloKB}</div>
                                  <div>Título: {asignacion.documentacion.articuloKB.titulo}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      )}

                      {!asignacion.documentacion && !asignacion.empleado && (
                        <p className="text-xs text-gray-500 italic">Sin información adicional disponible</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
};

export default TicketDetailViewer;
