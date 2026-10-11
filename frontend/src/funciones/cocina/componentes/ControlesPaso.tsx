// frontend/src/funciones/cocina/componentes/ControlesPaso.tsx
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Mic, RotateCcw, Volume2 } from "lucide-react";
import { detener, hablar, useVoz } from "../../../voz";
import { escucharNavegador, hayReconocimientoNavegador } from "../../../voz/transcripcion/reconocimientoNavegador";

// Si es true, Lyra dice "Te escucho" antes de abrir el micrófono manual (confirma que sí te va a oír).
// Si se siente lento, ponlo en false: igual se muestra "Te escucho…" en pantalla.
const DECIR_TE_ESCUCHO = true;

interface Props {
  esUltimo: boolean;
  alAnterior: () => void;
  alSiguiente: () => void;
  alRepetir: () => void;
  procesarTexto: (texto: string) => void;
  alTranscribir: (texto: string) => void;
}

// Convierte el error del reconocimiento en un mensaje claro y hablado.
function mensajeDeError(e: unknown): string {
  const err = e as { error?: string; message?: string } | undefined;
  const codigo = String(err?.error ?? err?.message ?? e ?? "");
  if (/not-allowed|service-not-allowed|permission/i.test(codigo)) {
    return "No tengo permiso para usar el micrófono. Actívalo en la configuración del navegador.";
  }
  if (/no-speech/i.test(codigo)) {
    return "No te escuché. Toca el micrófono y dime otra vez.";
  }
  if (/network/i.test(codigo)) {
    return "No pude escucharte porque falla el internet. Revisa tu conexión.";
  }
  return "No pude escucharte. Toca el micrófono para intentar de nuevo.";
}

export function ControlesPaso({ esUltimo, alAnterior, alSiguiente, alRepetir, procesarTexto, alTranscribir }: Props) {
  const { estado, setEstado } = useVoz();
  const [escuchando, setEscuchando] = useState(false);
  const hablando = estado === "hablando";
  // "oyendo" es true tanto con el micrófono manual como con la escucha automática.
  const oyendo = escuchando || estado === "escuchando";

  const alTocarMicrofono = async () => {
    // Evita abrir el micrófono dos veces (manual o automático ya activo).
    if (escuchando || useVoz.getState().estado === "escuchando") return;

    if (!hayReconocimientoNavegador()) {
      hablar("Tu navegador no permite usar el micrófono. Usa Chrome en Android.");
      return;
    }

    detener();
    setEscuchando(true);
    try {
      // Se espera a que Lyra termine de decirlo, para que el micrófono no la escuche a ella.
      if (DECIR_TE_ESCUCHO) await hablar("Te escucho.");
      setEstado("escuchando");

      const texto = await escucharNavegador();
      alTranscribir(texto);
      if (texto) procesarTexto(texto);
      else hablar("No te escuché bien. Toca el micrófono y dime otra vez.");
    } catch (e) {
      console.error("Error de reconocimiento:", e);
      hablar(mensajeDeError(e));
    } finally {
      setEscuchando(false);
      // Solo se vuelve a "espera" si Lyra no empezó a hablar mientras tanto.
      if (useVoz.getState().estado === "escuchando") setEstado("espera");
    }
  };

  return (
    <footer className="sticky bottom-0 border-t-2 border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
      <p className="mb-3 flex items-center justify-center gap-2 text-center text-xl font-bold text-slate-700">
        {hablando ? (
          <>
            <Volume2 className="h-6 w-6 text-blue-600" aria-hidden /> Lyra está hablando…
          </>
        ) : oyendo ? (
          "Te escucho…"
        ) : (
          "Toca el micrófono para hablar"
        )}
      </p>
      <div className="flex items-stretch gap-3">
        <button onClick={alAnterior} aria-label="Paso anterior" className="flex w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-900 active:bg-slate-300">
          <ArrowLeft className="h-8 w-8" />
        </button>

        <button
          onClick={alTocarMicrofono}
          aria-label="Tocar para hablar"
          className={`flex w-20 items-center justify-center rounded-2xl text-white active:scale-95 ${oyendo ? "animate-pulse bg-red-600" : "bg-blue-600"}`}
        >
          <Mic className="h-8 w-8" />
        </button>

        <button onClick={alSiguiente} className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-2xl font-extrabold text-white shadow-lg active:bg-blue-800">
          {esUltimo ? <>Terminar <Check className="h-8 w-8" /></> : <>Siguiente <ArrowRight className="h-8 w-8" /></>}
        </button>

        <button onClick={alRepetir} aria-label="Repetir el paso" className="flex w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-900 active:bg-slate-300">
          <RotateCcw className="h-8 w-8" />
        </button>
      </div>
    </footer>
  );
}