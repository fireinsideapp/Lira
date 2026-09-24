// Estado de la voz (Zustand). Fase 1: espera / hablando.
// Semana 2 agrega 'escuchando' y 'procesando' cuando entren la palabra clave y Whisper.
import { create } from "zustand";

export type EstadoVoz = "espera" | "escuchando" | "procesando" | "hablando";

interface VozStore {
  estado: EstadoVoz;
  setEstado: (e: EstadoVoz) => void;
}

export const useVoz = create<VozStore>((set) => ({
  estado: "espera",
  setEstado: (estado) => set({ estado }),
}));
