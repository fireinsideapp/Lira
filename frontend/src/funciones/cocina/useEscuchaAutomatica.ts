// frontend/src/funciones/cocina/useEscuchaAutomatica.ts
// Escucha automática por turnos: cuando Lyra termina de hablar, abre el micrófono sola.
// Cierra el micrófono mientras Lyra habla (así no se escucha a sí misma).
import { useEffect, useRef } from "react";
import { hablar, useVoz } from "../../voz";
import { escucharNavegador, hayReconocimientoNavegador } from "../../voz/transcripcion/reconocimientoNavegador";

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const MAX_FALLOS_SEGUIDOS = 5;

interface Opciones {
  activa: boolean;
  procesarTexto: (texto: string) => unknown;
  alTranscribir: (texto: string) => void;
  alDetenerse: () => void; // se llama si hay que apagar la escucha (permiso negado, muchos fallos)
}

export function useEscuchaAutomatica({ activa, procesarTexto, alTranscribir, alDetenerse }: Opciones) {
  // Refs para que el ciclo siempre use la versión más reciente sin reiniciarse.
  const procesarRef = useRef(procesarTexto);
  const transcribirRef = useRef(alTranscribir);
  const detenerseRef = useRef(alDetenerse);
  procesarRef.current = procesarTexto;
  transcribirRef.current = alTranscribir;
  detenerseRef.current = alDetenerse;

  useEffect(() => {
    if (!activa || !hayReconocimientoNavegador()) return;
    let cancelado = false;

    (async () => {
      let fallos = 0;
      while (!cancelado) {
        // 1. Espera a que Lyra (u otro micrófono) no esté activo.
        while (!cancelado && useVoz.getState().estado !== "espera") await esperar(200);
        if (cancelado) break;

        // 2. Pausa corta para no captar el final de la voz de Lyra.
        await esperar(500);
        if (cancelado || useVoz.getState().estado !== "espera") continue;

        // 3. Escucha un turno.
        useVoz.getState().setEstado("escuchando");
        let texto = "";
        try {
          texto = await escucharNavegador();
          fallos = 0;
        } catch (e) {
          const err = e as { error?: string; message?: string } | undefined;
          const codigo = String(err?.error ?? err?.message ?? e ?? "");
          if (/not-allowed|service-not-allowed|permission/i.test(codigo)) {
            detenerseRef.current();
            hablar("No tengo permiso para usar el micrófono. Puedes usar los botones, o activarlo en la configuración del navegador.");
            return;
          }
          // El silencio (no-speech) no cuenta como fallo: simplemente se vuelve a escuchar.
          if (!/no-speech|aborted/i.test(codigo)) fallos++;
          if (fallos >= MAX_FALLOS_SEGUIDOS) {
            detenerseRef.current();
            hablar("Dejé de escuchar porque algo falló. Toca el micrófono cuando quieras hablarme.");
            return;
          }
          await esperar(800);
        } finally {
          if (useVoz.getState().estado === "escuchando") useVoz.getState().setEstado("espera");
        }
        if (cancelado) break;

        // 4. Procesa lo que dijo (ignora ruidos de menos de 3 letras).
        const limpio = texto.trim();
        if (limpio.length >= 3) {
          transcribirRef.current(limpio);
          await procesarRef.current(limpio);
          await esperar(700); // da tiempo a que Lyra empiece a hablar antes de reabrir el micrófono
        } else {
          await esperar(300);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [activa]);
}