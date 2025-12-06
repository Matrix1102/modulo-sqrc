import React, { createContext, useContext, useState, useMemo } from "react";

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "AGENTE" | "SUPERVISOR" | "ADMIN";
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

// Usuario simulado por defecto (en producción vendría de la autenticación)
const DEFAULT_USER: User = {
  id: 6, // Sofia Call - Agente de Llamada
  nombre: "Sofia Call",
  email: "sofia.call@sqrc.com",
  rol: "AGENTE",
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: user !== null,
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};

// Hook de conveniencia para obtener solo el ID del usuario
export const useUserId = (): number => {
  const { user } = useUser();
  return user?.id ?? 0;
};

export default UserContext;
