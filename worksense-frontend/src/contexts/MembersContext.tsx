import React, { createContext, useState, useContext } from "react";
import type Member from "@/types/MemberType";

// Tipo para la lista de miembros
type MembersList = Member[];

// Definición del tipo del contexto
type MembersContextType = [
  MembersList,
  React.Dispatch<React.SetStateAction<MembersList>>
];

// Valor inicial del contexto
const initialContext: MembersContextType = [[], () => {}];

// Creación del contexto
export const MembersContext = createContext<MembersContextType>(initialContext);

// Provider component
export const MembersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const membersState = useState<MembersList>([]);

  return (
    <MembersContext.Provider value={membersState}>
      {children}
    </MembersContext.Provider>
  );
};

// Custom hook para usar el contexto
export const useMembersContext = () => {
  const context = useContext(MembersContext);

  if (!context) {
    throw new Error("useMembersContext debe usarse dentro de un MembersProvider");
  }

  return context;
};
