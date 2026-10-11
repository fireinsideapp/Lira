import { createContext, useCallback, useContext, type ReactNode } from "react";
import { detener, hablar } from "../../voz";

type Anunciar = (texto: string) => void;
const AvisoCtx = createContext<Anunciar>(() => {});
export const useAviso = () => useContext(AvisoCtx);

export function AvisoProvider({ children }: { children: ReactNode }) {
  const anunciar = useCallback<Anunciar>((texto) => {
    detener(); // corta lo anterior para que no se empalmen
    hablar(texto);
  }, []);

  return <AvisoCtx.Provider value={anunciar}>{children}</AvisoCtx.Provider>;
}