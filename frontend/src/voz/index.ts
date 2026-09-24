// Unica API publica del modulo de voz. El resto de la app solo importa desde aqui.
export { hablar, detener } from "./habla/hablar";
export { useVoz } from "./useVoz";
export type { EstadoVoz } from "./useVoz";
