/**
 * Pestaña de Documentación del Ticket
 * Permite documentar la problemática y solución con artículos de base de conocimiento
 */
import React, { useState } from 'react';
import type { DocumentacionDTO, CreateDocumentacionRequest } from '../../types';

interface DocumentacionTabProps {
  documentacion: DocumentacionDTO[];
  onAddDocumentacion: (data: CreateDocumentacionRequest) => Promise<void>;
  loading?: boolean;
}

export const DocumentacionTab: React.FC<DocumentacionTabProps> = ({
  documentacion,
  onAddDocumentacion,
  loading = false,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problema, setProblema] = useState('');
  const [solucion, setSolucion] = useState('');
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!problema.trim() || !solucion.trim()) {
      setError('Complete todos los campos obligatorios');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onAddDocumentacion({
        problema,
        solucion,
        empleadoId: 6, // TODO: Obtener del contexto de usuario autenticado
      });
      
      // Limpiar formulario
      setProblema('');
      setSolucion('');
      setArticuloSeleccionado(null);
      setIsFormOpen(false);
    } catch {
      setError('Error al guardar la documentación');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProblema('');
    setSolucion('');
    setArticuloSeleccionado(null);
    setError('');
    setIsFormOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando documentación...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Botón para agregar documentación */}
      {!isFormOpen && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Documentación
        </button>
      )}

      {/* Formulario de nueva documentación */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Documentación</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Problemática */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problemática <span className="text-red-500">*</span>
              </label>
              <textarea
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                placeholder="Describe la problemática identificada..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Buscar artículo de base de conocimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artículo de Base de Conocimiento (opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artículo relacionado..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Artículo seleccionado */}
              {articuloSeleccionado && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-blue-700">{articuloSeleccionado}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArticuloSeleccionado(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Solución */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solución <span className="text-red-500">*</span>
              </label>
              <textarea
                value={solucion}
                onChange={(e) => setSolucion(e.target.value)}
                placeholder="Describe la solución aplicada..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  saving
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? 'Guardando...' : 'Guardar Documentación'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de documentación existente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Documentación del Caso
          {documentacion.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({documentacion.length} {documentacion.length === 1 ? 'registro' : 'registros'})
            </span>
          )}
        </h3>

        {documentacion.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No hay documentación registrada para este ticket.</p>
            <p className="text-sm text-gray-400 mt-1">
              Agrega la problemática y solución del caso.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documentacion.map((doc) => (
              <div
                key={doc.idDocumentacion}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {doc.empleado?.nombre ?? 'Agente'} {doc.empleado?.apellido ?? ''}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(doc.fechaCreacion)}</p>
                    </div>
                  </div>
                </div>

                {/* Problemática */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Problemática
                  </h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{doc.problema}</p>
                </div>

                {/* Solución */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Solución
                  </h4>
                  <p className="text-gray-600 text-sm bg-green-50 p-3 rounded-lg">{doc.solucion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentacionTab;
