/**
 * Modal para autenticar cliente antes de crear ticket
 */
import { useState } from 'react';
import type { ClienteDTO } from '../types';
import { buscarClientePorDni, getClienteById } from '../services/ticketApi';

interface ClienteAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteAutenticado: (cliente: ClienteDTO) => void;
}

export const ClienteAuthModal = ({ isOpen, onClose, onClienteAutenticado }: ClienteAuthModalProps) => {
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [esFamiliar, setEsFamiliar] = useState(false);
  const [nombreFamiliar, setNombreFamiliar] = useState('');

  const handleBuscar = async () => {
    if (!busqueda || busqueda.trim().length === 0) {
      setError('Ingrese un DNI (8 dígitos) o ID del cliente');
      return;
    }

    setLoading(true);
    setError('');
    setCliente(null);

    try {
      // Detectar si es DNI (8 dígitos numéricos) o ID del cliente
      const esNumerico = /^\d+$/.test(busqueda.trim());
      
      if (esNumerico && busqueda.trim().length === 8) {
        // Buscar por DNI
        const result = await buscarClientePorDni(busqueda.trim());
        setCliente(result);
      } else if (esNumerico) {
        // Buscar por ID
        const result = await getClienteById(parseInt(busqueda.trim()));
        setCliente(result);
      } else {
        setError('Ingrese solo números (DNI de 8 dígitos o ID del cliente)');
      }
    } catch {
      setError('Cliente no encontrado. Verifique el DNI o ID ingresado.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutenticar = () => {
    if (cliente) {
      onClienteAutenticado({
        ...cliente,
        esFamiliar,
        nombreFamiliar: esFamiliar ? nombreFamiliar : undefined,
      });
    }
  };

  const handleClose = () => {
    setBusqueda('');
    setCliente(null);
    setError('');
    setEsFamiliar(false);
    setNombreFamiliar('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={handleClose}
      />

      {/* Panel lateral (Drawer) */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Autenticación de Cliente</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 text-center">
                  Para crear un ticket se debe autenticar al cliente.
                </p>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrese DNI o ID del cliente
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingrese DNI (8 dígitos) o ID"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  />
                  <button
                    onClick={handleBuscar}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>

              {/* Cliente Info */}
              {cliente && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  {/* ID */}
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">ID:</span>
                    <span className="font-medium">{cliente.idCliente}</span>
                  </div>

                  {/* Datos Personales */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">Datos Personales</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">DNI:</span>
                        <span className="text-gray-900">{cliente.dni}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nombre:</span>
                        <span className="text-gray-900">{cliente.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Apellido:</span>
                        <span className="text-gray-900">{cliente.apellido}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha Nacimiento:</span>
                        <span className="text-gray-900 flex items-center gap-1">
                          {formatDate(cliente.fechaNacimiento)}
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Datos Contacto */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">Datos Contacto</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Correo:</span>
                        <span className="text-gray-900">{cliente.correo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="text-gray-900">{cliente.telefono || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Celular:</span>
                        <span className="text-gray-900">{cliente.celular}</span>
                      </div>
                    </div>
                  </div>

                  {/* Es Familiar */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-700">Es un familiar?</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="esFamiliar"
                            checked={esFamiliar}
                            onChange={() => setEsFamiliar(true)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">SI</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="esFamiliar"
                            checked={!esFamiliar}
                            onChange={() => setEsFamiliar(false)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">NO</span>
                        </label>
                      </div>
                    </div>
                    {esFamiliar && (
                      <input
                        type="text"
                        value={nombreFamiliar}
                        onChange={(e) => setNombreFamiliar(e.target.value)}
                        placeholder="Ingresar nombre de familiar:"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleAutenticar}
                disabled={!cliente}
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  cliente
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Cliente Autenticado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
