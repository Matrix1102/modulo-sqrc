import React, { useEffect, useState } from "react";
import { getTicketHistory, type TicketHistoryResponse } from "../../../../services/vista360Api";
import {
  TicketHeader,
  TicketDescription,
  TicketGeneralInfo,
  TicketTypeInfoSection,
  AssignmentHistorySection,
} from "./components";

export interface TicketDetailViewerProps {
  ticketId: number | null;
}

// Mapeo de estados en español
const ESTADOS_MAP: Record<string, string> = {
  ABIERTO: "Abierto",
  ESCALADO: "Escalado",
  DERIVADO: "Derivado",
  CERRADO: "Cerrado",
};

// Determinar prioridad basada en tipo
const getPriority = (tipoTicket: string): string => {
  switch (tipoTicket) {
    case "RECLAMO":
      return "Alta";
    case "QUEJA":
      return "Media";
    default:
      return "Baja";
  }
};

const TicketDetailViewer: React.FC<TicketDetailViewerProps> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<TicketHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        console.error("Error loading ticket history:", error);
        setTicket(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

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

  const estadoEsp = ESTADOS_MAP[ticket.estado] || ticket.estado;
  const priority = getPriority(ticket.tipoTicket);

  return (
    <section className="flex h-full flex-col gap-5 overflow-y-auto rounded-xl bg-gray-100 p-6">
      <TicketHeader
        titulo={ticket.titulo}
        motivo={ticket.motivo}
        estadoEsp={estadoEsp}
      />

      <TicketDescription descripcion={ticket.descripcion} />

      <TicketGeneralInfo
        tipoTicket={ticket.tipoTicket}
        origen={ticket.origen}
        priority={priority}
        fechaCreacion={ticket.fechaCreacion}
        fechaCierre={ticket.fechaCierre}
        clienteId={ticket.clienteId}
      />

      <TicketTypeInfoSection
        consultaInfo={ticket.consultaInfo}
        quejaInfo={ticket.quejaInfo}
        solicitudInfo={ticket.solicitudInfo}
        reclamoInfo={ticket.reclamoInfo}
      />

      <AssignmentHistorySection asignaciones={ticket.asignaciones} />
    </section>
  );
};

export default TicketDetailViewer;
