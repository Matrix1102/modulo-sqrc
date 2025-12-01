import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ClienteBasicoDTO } from "../../../services/vista360Api";

interface CustomerContextType {
  cliente: ClienteBasicoDTO | null;
  setCliente: (cliente: ClienteBasicoDTO | null) => void;
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

  return (
    <CustomerContext.Provider value={{ cliente, setCliente }}>
      {children}
    </CustomerContext.Provider>
  );
};
