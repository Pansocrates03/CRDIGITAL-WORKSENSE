// src/contexts/FridaChatPositionContext.tsx
import React, { createContext, useContext, useState } from "react";

type FridaChatPosition = "left" | "right";

interface FridaChatContextType {
  position: FridaChatPosition;
  setPosition: (position: FridaChatPosition) => void;
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
}

const FridaChatContext = createContext<FridaChatContextType>({
  position: "right",
  setPosition: () => {},
  isHidden: false,
  setIsHidden: () => {},
});

export const useFridaChatPosition = () => useContext(FridaChatContext);

export const FridaChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [position, setPosition] = useState<FridaChatPosition>("right");
  const [isHidden, setIsHidden] = useState<boolean>(false);

  return (
    <FridaChatContext.Provider
      value={{ position, setPosition, isHidden, setIsHidden }}
    >
      {children}
    </FridaChatContext.Provider>
  );
};
