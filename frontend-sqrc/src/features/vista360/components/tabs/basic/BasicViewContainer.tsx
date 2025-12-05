import React, { useState } from "react";
import CustomerSearch from "./CustomerSearch";
import CustomerProfileForm from "./CustomerProfileForm";
import ServiceStatsGrid from "./ServiceStatsGrid";
import { 
  obtenerClientePorId, 
  obtenerMetricasCliente, 
  type ClienteBasicoDTO, 
  type MetricaKPI 
} from "../../../../../services/vista360Api";
import { useCustomer } from "../../../context/CustomerContext";

const BasicViewContainer: React.FC = () => {
  const { cliente, setCliente } = useCustomer();
  const [metricas, setMetricas] = useState<MetricaKPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSearch = async (searchValue: string) => {
    if (!searchValue) {
      setError("Por favor ingrese un ID de cliente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let clienteData: ClienteBasicoDTO;

      // Solo búsqueda por ID (la búsqueda por DNI no está disponible en el API externo)
      if (/^\d+$/.test(searchValue)) {
        clienteData = await obtenerClientePorId(Number(searchValue));
      } else {
        setError("Formato inválido. Ingrese un ID numérico de cliente");
        setLoading(false);
        return;
      }

      setCliente(clienteData);

      // Obtener métricas del cliente
      const metricasData = await obtenerMetricasCliente(clienteData.idCliente);
      setMetricas(metricasData);
    } catch (err: any) {
      setError(err.message || "Error al buscar el cliente");
      setCliente(null);
      setMetricas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_1fr]">
      <div className="order-1 flex flex-col gap-6 lg:order-none">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <CustomerSearch onSearch={handleSearch} />
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
              Buscando cliente...
            </div>
          )}
        </div>
        <div className="flex-1">
          <CustomerProfileForm 
            cliente={cliente} 
            loading={loading}
            onClienteUpdated={setCliente}
          />
        </div>
      </div>

      <section className="order-2 flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:order-none">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas de atención</h3>
          <span className="text-sm text-gray-500">Últimos 30 días</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <ServiceStatsGrid metricas={metricas} loading={loading} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BasicViewContainer;
