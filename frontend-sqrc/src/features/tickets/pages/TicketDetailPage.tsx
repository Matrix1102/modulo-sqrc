/**
 * Página de detalle del ticket
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TicketDetailLayout, 
  DetallesTab, 
  DocumentacionTab, 
  HiloTab,
  type TicketTabKey 
} from '../components/detail';
import { 
  getTicketById, 
  getDocumentacion, 
  addDocumentacion 
} from '../services/ticketApi';
import type { 
  TicketDetail, 
  DocumentacionDTO, 
  CreateDocumentacionRequest 
} from '../types';

export const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [documentacion, setDocumentacion] = useState<DocumentacionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TicketTabKey>('detalles');

  useEffect(() => {
    if (ticketId) {
      loadTicketData(parseInt(ticketId));
    }
  }, [ticketId]);

  const loadTicketData = async (id: number) => {
    setLoading(true);
    setError('');

    try {
      const [ticketData, docs] = await Promise.all([
        getTicketById(id),
        getDocumentacion(id).catch(() => []),
      ]);

      setTicket(ticketData);
      setDocumentacion(docs);
    } catch {
      setError('Error al cargar los datos del ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocumentacion = async (data: CreateDocumentacionRequest) => {
    if (!ticketId) return;
    
    setDocLoading(true);
    try {
      const newDoc = await addDocumentacion(parseInt(ticketId), data);
      setDocumentacion((prev) => [newDoc, ...prev]);
    } finally {
      setDocLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando ticket...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error || 'Ticket no encontrado'}</p>
          <button
            onClick={() => navigate('/agente/tickets')}
            className="text-blue-600 hover:underline"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <TicketDetailLayout
      ticket={ticket}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'detalles' && <DetallesTab ticket={ticket} />}
      
      {activeTab === 'documentacion' && (
        <DocumentacionTab
          documentacion={documentacion}
          onAddDocumentacion={handleAddDocumentacion}
          loading={docLoading}
        />
      )}
      
      {activeTab === 'hilo' && <HiloTab />}
    </TicketDetailLayout>
  );
};
