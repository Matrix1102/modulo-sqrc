/**
 * Página de detalle del ticket
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
  addDocumentacion,
  verificarCierre,
  cerrarTicket,
} from '../services/ticketApi';
import { useUserId } from '../../../context';
import { showToast } from '../../../services/notification';
import type { 
  TicketDetail, 
  DocumentacionDTO, 
  CreateDocumentacionRequest,
  CierreValidacionResponse,
} from '../types';

export const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const empleadoId = useUserId();

  // Detectar la ruta base actual
  const getBasePath = () => {
    const path = location.pathname;
    if (path.startsWith('/agente-llamada')) return '/agente-llamada';
    if (path.startsWith('/agente-presencial')) return '/agente-presencial';
    if (path.startsWith('/backoffice')) return '/backoffice';
    if (path.startsWith('/supervisor')) return '/supervisor';
    return '/agente-llamada';
  };

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [documentacion, setDocumentacion] = useState<DocumentacionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TicketTabKey>('detalles');
  
  // Estado para cierre de ticket
  const [cierreValidacion, setCierreValidacion] = useState<CierreValidacionResponse | null>(null);
  const [cierreLoading, setCierreLoading] = useState(false);

  const loadTicketData = useCallback(async (id: number) => {
    setLoading(true);
    setError('');

    try {
      const [ticketData, docs] = await Promise.all([
        getTicketById(id),
        getDocumentacion(id).catch(() => []),
      ]);

      setTicket(ticketData);
      setDocumentacion(docs);

      // Cargar validación de cierre si el ticket no está cerrado
      if (ticketData.estado !== 'CERRADO') {
        const validacion = await verificarCierre(id);
        setCierreValidacion(validacion);
      }
    } catch {
      setError('Error al cargar los datos del ticket');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ticketId) {
      loadTicketData(parseInt(ticketId));
    }
  }, [ticketId, loadTicketData]);

  const handleAddDocumentacion = async (data: CreateDocumentacionRequest) => {
    if (!ticketId) return;
    
    setDocLoading(true);
    try {
      const newDoc = await addDocumentacion(parseInt(ticketId), data);
      setDocumentacion((prev) => [newDoc, ...prev]);
      // Recargar validación de cierre
      const validacion = await verificarCierre(parseInt(ticketId));
      setCierreValidacion(validacion);
    } finally {
      setDocLoading(false);
    }
  };

  // Lógica para cerrar ticket
  const handleCerrarTicket = async () => {
    if (!ticket || !empleadoId) return;
    
    setCierreLoading(true);
    try {
      await cerrarTicket(ticket.idTicket, empleadoId);
      showToast('Ticket cerrado exitosamente', 'success');
      // Recargar datos del ticket
      await loadTicketData(ticket.idTicket);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar el ticket';
      showToast(errorMessage, 'error');
    } finally {
      setCierreLoading(false);
    }
  };

  //LÓGICA PARA IR A LA PANTALLA DE RESPONDER
  const handleAtender = () => {
    if (!ticket) return;
    const basePath = getBasePath();

    navigate(`${basePath}/tickets/responder/${ticket.idTicket}`, { 
        state: { 
            ticket: {
                id: ticket.idTicket,
                tipo: ticket.tipoTicket, // Asegúrate que este campo venga en tu DTO TicketDetail
                clienteCorreo: ticket.cliente?.correo || '', 
                numeroTicket: ticket.idTicket.toString()
            } 
        } 
    });
  };

  // Renderizar indicadores de requisitos
  const renderRequisitos = () => {
    if (!cierreValidacion || ticket?.estado === 'CERRADO') return null;
    
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className={`flex items-center gap-1 ${cierreValidacion.tieneRespuestaEnviada ? 'text-green-600' : 'text-gray-400'}`}>
          {cierreValidacion.tieneRespuestaEnviada ? <FaCheckCircle /> : <FaTimesCircle />}
          Respuesta
        </span>
        <span className={`flex items-center gap-1 ${cierreValidacion.tieneDocumentacion ? 'text-green-600' : 'text-gray-400'}`}>
          {cierreValidacion.tieneDocumentacion ? <FaCheckCircle /> : <FaTimesCircle />}
          Documentación
        </span>
      </div>
    );
  };

  const botonesAccion = (
    <div className="flex items-center gap-3">
      {renderRequisitos()}
      
      {ticket?.estado !== 'CERRADO' && (
        <>
          <button
            onClick={handleAtender}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium text-sm"
          >
            <FaPaperPlane /> Responder / Atender
          </button>
          
          <button
            onClick={handleCerrarTicket}
            disabled={!cierreValidacion?.puedeCerrar || cierreLoading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium text-sm
              ${cierreValidacion?.puedeCerrar 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            title={cierreValidacion?.mensaje || 'Verificando requisitos...'}
          >
            <FaLock /> {cierreLoading ? 'Cerrando...' : 'Cerrar Ticket'}
          </button>
        </>
      )}
    </div>
  );

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
            onClick={() => navigate(getBasePath())}
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
      actions={botonesAccion}  
    >
      {activeTab === 'detalles' && (
        <DetallesTab 
          ticket={ticket} 
          onRefresh={() => loadTicketData(parseInt(ticketId!))}
        />
      )}
      
      {activeTab === 'documentacion' && (
        <DocumentacionTab
          documentacion={documentacion}
          onAddDocumentacion={handleAddDocumentacion}
          loading={docLoading}
        />
      )}
      
      {activeTab === 'hilo' && ticketId && <HiloTab ticketId={Number(ticketId)} />}
    </TicketDetailLayout>
  );
};
