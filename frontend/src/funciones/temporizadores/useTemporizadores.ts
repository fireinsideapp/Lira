// Temporizadores locales (fase 1). Guardan la hora de fin ABSOLUTA y calculan el tiempo restante contra ella.
// Solo avisan con la app abierta (voz + vibracion). Semana 3: se mueven al servidor con Web Push.
import { useCallback, useEffect, useState } from "react";
import { hablar } from "../../voz";

interface Temporizador {
  id: string;
  nombre: string;
  terminaEn: number;
  sonando: boolean;
}

export function useTemporizadores() {
  const [lista, setLista] = useState<Temporizador[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    if (lista.length === 0) return;
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, [lista.length]);

  useEffect(() => {
    const vencidos = lista.filter((t) => !t.sonando && ahora >= t.terminaEn);
    if (vencidos.length === 0) return;
    setLista((l) => l.map((t) => (vencidos.some((v) => v.id === t.id) ? { ...t, sonando: true } : t)));
    navigator.vibrate?.([500, 200, 500, 200, 500]);
    hablar(`Se acabó el tiempo de: ${vencidos[0].nombre}. Revisa la estufa.`);
  }, [ahora, lista]);

  const agregar = useCallback((id: string, nombre: string, segundos: number) => {
    setLista((l) =>
      l.some((t) => t.id === id) ? l : [...l, { id, nombre, terminaEn: Date.now() + segundos * 1000, sonando: false }]
    );
    setAhora(Date.now());
  }, []);

  const quitar = useCallback((id: string) => setLista((l) => l.filter((t) => t.id !== id)), []);

  const conRestante = lista.map((t) => ({ ...t, restante: Math.max(0, Math.ceil((t.terminaEn - ahora) / 1000)) }));
  return { temporizadores: conRestante, agregar, quitar };
}
