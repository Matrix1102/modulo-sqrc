import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ClienteBasicoDTO, MetricaKPI } from "../../../services/vista360Api";

interface TicketCache {
  tickets: any[];
  lastFetched: number;
}

interface CustomerContextType {
  cliente: ClienteBasicoDTO | null;
  setCliente: (cliente: ClienteBasicoDTO | null) => void;
  metricas: MetricaKPI[];
  setMetricas: (metricas: MetricaKPI[]) => void;
  ticketCache: TicketCache | null;
  setTicketCache: (cache: TicketCache | null) => void;
  clearAll: () => void;
  isLoadingTickets: boolean;
  setIsLoadingTickets: (loading: boolean) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [cliente, setCliente] = useState<ClienteBasicoDTO | null>(null);
  const [metricas, setMetricas] = useState<MetricaKPI[]>([]);
  const [ticketCache, setTicketCache] = useState<TicketCache | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const clearAll = useCallback(() => {
    setCliente(null);
    setMetricas([]);
    setTicketCache(null);
    setIsLoadingTickets(false);
  }, []);

  return (
    <CustomerContext.Provider value={{ 
      cliente, 
      setCliente, 
      metricas, 
      setMetricas,
      ticketCache,
      setTicketCache,
      clearAll,
      isLoadingTickets,
      setIsLoadingTickets
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
