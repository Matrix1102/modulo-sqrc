import React, { useEffect, useState } from 'react';
import {
  obtenerClientePorId,
  buscarClientePorDni,
  obtenerMetricasCliente,
  actualizarInformacionContacto,
  healthCheck,
  type ClienteBasicoDTO,
  type MetricaKPI,
} from '../../../services/vista360Api';

/**
 * Componente de prueba para verificar la integración con el backend
 * Vista360 Cliente API.
 */
const TestApiIntegration: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [cliente, setCliente] = useState<ClienteBasicoDTO | null>(null);
  const [metricas, setMetricas] = useState<MetricaKPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dni, setDni] = useState('74935134');
  const [idCliente, setIdCliente] = useState('1');

  // Health check al montar
  useEffect(() => {
    healthCheck()
      .then((status) => setHealthStatus(status))
      .catch((err) => setHealthStatus(`Error: ${err.message}`));
  }, []);

  const handleBuscarPorId = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerClientePorId(Number(idCliente));
      setCliente(data);
      const metricasData = await obtenerMetricasCliente(Number(idCliente));
      setMetricas(metricasData);
    } catch (err: any) {
      setError(err.message);
      setCliente(null);
      setMetricas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarPorDni = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await buscarClientePorDni(dni);
      setCliente(data);
      const metricasData = await obtenerMetricasCliente(data.idCliente);
      setMetricas(metricasData);
    } catch (err: any) {
      setError(err.message);
      setCliente(null);
      setMetricas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarContacto = async () => {
    if (!cliente) return;
    setLoading(true);
    setError('');
    try {
      const updated = await actualizarInformacionContacto(cliente.idCliente, {
        correo: 'actualizado@example.com',
        telefono: '999888777',
        celular: '987654321',
      });
      setCliente(updated);
      alert('Contacto actualizado exitosamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMetricaColor = (estado: MetricaKPI['estadoTendencia']) => {
    switch (estado) {
      case 'POSITIVO':
        return 'text-green-600 bg-green-50';
      case 'NEGATIVO':
        return 'text-red-600 bg-red-50';
      case 'NEUTRO':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Integración API Vista360</h1>

      {/* Health Status */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          <strong>Health Check:</strong> {healthStatus || 'Cargando...'}
        </p>
      </div>

      {/* Controles de búsqueda */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold mb-3">Buscar por ID</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="ID del cliente"
            />
            <button
              onClick={handleBuscarPorId}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold mb-3">Buscar por DNI</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="DNI (8 dígitos)"
              maxLength={8}
            />
            <button
              onClick={handleBuscarPorDni}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-900">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      )}

      {/* Datos del Cliente */}
      {cliente && (
        <div className="mb-6 p-6 border rounded-lg bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Datos del Cliente</h2>
            <button
              onClick={handleActualizarContacto}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              Actualizar Contacto (Test)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ID</p>
              <p className="font-semibold">{cliente.idCliente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">DNI</p>
              <p className="font-semibold">{cliente.dni}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nombres</p>
              <p className="font-semibold">{cliente.nombres}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Apellidos</p>
              <p className="font-semibold">{cliente.apellidos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p className="font-semibold">{cliente.fechaNacimiento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correo</p>
              <p className="font-semibold">{cliente.correo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-semibold">{cliente.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Celular</p>
              <p className="font-semibold">{cliente.celular}</p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas KPI */}
      {metricas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Métricas KPI</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricas.map((metrica, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border shadow-sm ${getMetricaColor(metrica.estadoTendencia)}`}
              >
                <p className="text-sm font-medium mb-2">{metrica.titulo}</p>
                <p className="text-3xl font-bold mb-1">
                  {metrica.valorPrincipal}
                  <span className="text-lg ml-1">{metrica.unidad}</span>
                </p>
                <p className="text-xs">{metrica.subtituloTendencia}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {!cliente && !loading && !error && (
        <div className="p-6 border-2 border-dashed rounded-lg text-center text-gray-500">
          <p className="mb-2">👆 Usa los controles de arriba para buscar un cliente</p>
          <p className="text-sm">
            Asegúrate de que el backend esté corriendo en <code>http://localhost:8080</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default TestApiIntegration;
