import React, { useState } from "react";
import CustomerSearch from "./CustomerSearch";
import CustomerProfileForm from "./CustomerProfileForm";
import ServiceStatsGrid from "./ServiceStatsGrid";
import { Trash2 } from "lucide-react";
import { 
  obtenerClientePorId, 
  buscarClientePorDni,
  obtenerMetricasCliente,
  getTicketsByClienteId, 
  type ClienteBasicoDTO
} from "../../../../../services/vista360Api";
import { useCustomer } from "../../../context/CustomerContext";

// Saldos calculados de productos y servicios (datos mock)
// En producción estos valores vendrían del backend
const SALDO_PRODUCTOS = 499.85;  // Suma de balances: 249.95 + 150.00 + 99.90
const SALDO_SERVICIOS = 338.80;  // Suma de balances de servicios

const BasicViewContainer: React.FC = () => {
  const { 
    cliente, 
    setCliente, 
    metricas, 
    setMetricas, 
    setTicketCache,
    setIsLoadingTickets,
    clearAll 
  } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Cargar tickets en segundo plano cuando se obtiene un cliente
  const loadTicketsInBackground = async (clienteId: number) => {
    setIsLoadingTickets(true);
    try {
      const ticketsData = await getTicketsByClienteId(clienteId);
      setTicketCache({
        tickets: ticketsData,
        lastFetched: Date.now()
      });
    } catch (err) {
      console.error("Error cargando tickets en segundo plano:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSearch = async (searchValue: string) => {
    if (!searchValue) {
      setError("Por favor ingrese un ID o DNI de cliente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let clienteData: ClienteBasicoDTO;

      // Detectar si es DNI (8 dígitos) o ID (número cualquiera)
      const isDni = /^\d{8}$/.test(searchValue);
      const isId = /^\d+$/.test(searchValue) && !isDni;

      if (isDni) {
        // Búsqueda por DNI
        clienteData = await buscarClientePorDni(searchValue);
      } else if (isId) {
        // Búsqueda por ID
        clienteData = await obtenerClientePorId(Number(searchValue));
      } else {
        setError("Formato inválido. Ingrese un ID numérico o DNI (8 dígitos)");
        setLoading(false);
        return;
      }

      setCliente(clienteData);

      // Obtener métricas del cliente
      const metricasData = await obtenerMetricasCliente(clienteData.idCliente);
      setMetricas(metricasData);

      // Cargar tickets en segundo plano
      loadTicketsInBackground(clienteData.idCliente);

    } catch (err: any) {
      setError(err.message || "Error al buscar el cliente");
      setCliente(null);
      setMetricas([]);
      setTicketCache(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearAll();
    setError("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_1fr]">
      <div className="order-1 flex flex-col gap-6 lg:order-none">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomerSearch 
                onSearch={handleSearch} 
                placeholder="Ingrese ID o DNI del cliente"
              />
            </div>
            {cliente && (
              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
                title="Limpiar búsqueda"
              >
                <Trash2 size={16} />
                Limpiar
              </button>
            )}
          </div>
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
          <div className="w-full">
            <ServiceStatsGrid 
              metricas={metricas} 
              loading={loading} 
              saldoProductos={cliente ? SALDO_PRODUCTOS : 0}
              saldoServicios={cliente ? SALDO_SERVICIOS : 0}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BasicViewContainer;
