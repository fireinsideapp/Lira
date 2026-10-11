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

const RECORDATORIO_MS = 20000; // mientras un temporizador siga sonando, Lyra lo recuerda cada 20 s

// "Temporizador" es el nombre genérico de los que pone el usuario por voz.
const esGenerico = (nombre: string) => nombre.trim().toLowerCase() === "temporizador";

// Une nombres en español: "A", "A y B", "A, B y C".
function unirNombres(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? "";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

function frase(vencidos: Temporizador[], recordatorio: boolean): string {
  const nombres = vencidos.filter((t) => !esGenerico(t.nombre)).map((t) => t.nombre);
  const hayGenerico = vencidos.some((t) => esGenerico(t.nombre));

  let quien: string;
  if (nombres.length === 0) quien = vencidos.length > 1 ? "Tus temporizadores terminaron" : "Tu temporizador terminó";
  else if (hayGenerico) quien = `Terminó el tiempo de ${unirNombres(nombres)} y de otro temporizador`;
  else quien = `Terminó el tiempo de ${unirNombres(nombres)}`;

  return recordatorio
    ? `Recuerda: ${quien.charAt(0).toLowerCase()}${quien.slice(1)}. Revisa la estufa.`
    : `¡Tiempo cumplido! ${quien}. Revisa la estufa.`;
}

export function useTemporizadores() {
  const [lista, setLista] = useState<Temporizador[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    if (lista.length === 0) return;
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, [lista.length]);

  // Aviso cuando uno o varios temporizadores terminan (si terminan juntos, se avisa de todos).
  useEffect(() => {
    const vencidos = lista.filter((t) => !t.sonando && ahora >= t.terminaEn);
    if (vencidos.length === 0) return;
    setLista((l) => l.map((t) => (vencidos.some((v) => v.id === t.id) ? { ...t, sonando: true } : t)));
    navigator.vibrate?.([500, 200, 500, 200, 500]);
    hablar(frase(vencidos, false));
  }, [ahora, lista]);

  // Recordatorio: si el usuario no apaga el temporizador, Lyra insiste hasta que lo quite.
  const sonandoIds = lista.filter((t) => t.sonando).map((t) => t.id).join("|");
  useEffect(() => {
    if (!sonandoIds) return;
    const recordar = setInterval(() => {
      setLista((actual) => {
        const sonando = actual.filter((t) => t.sonando);
        if (sonando.length > 0) {
          navigator.vibrate?.([300, 150, 300]);
          hablar(frase(sonando, true));
        }
        return actual;
      });
    }, RECORDATORIO_MS);
    return () => clearInterval(recordar);
  }, [sonandoIds]);

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