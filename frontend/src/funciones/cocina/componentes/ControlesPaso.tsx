// Controles inferiores: Anterior, Siguiente (grande) y Repetir. Sin microfono todavia (semana 2).
import { ArrowLeft, ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import { useVoz } from "../../../voz";

interface Props {
  esUltimo: boolean;
  alAnterior: () => void;
  alSiguiente: () => void;
  alRepetir: () => void;
}

export function ControlesPaso({ esUltimo, alAnterior, alSiguiente, alRepetir }: Props) {
  const hablando = useVoz((s) => s.estado) === "hablando";
  return (
    <footer className="sticky bottom-0 border-t-2 border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
      <p className="mb-3 flex items-center justify-center gap-2 text-center text-xl font-bold text-slate-700">
        {hablando ? (
          <>
            <Volume2 className="h-6 w-6 text-[#8FB9A1]" aria-hidden /> Lyra está hablando…
          </>
        ) : (
          "Toca «Siguiente» cuando termines"
        )}
      </p>
      <div className="flex items-stretch gap-3">
        <button onClick={alAnterior} aria-label="Paso anterior" className="flex w-20 items-center justify-center rounded-2xl bg-slate-200 text-slate-900 active:bg-slate-300 transition-colors">
          <ArrowLeft className="h-9 w-9" />
        </button>
        <button onClick={alSiguiente} className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#8FB9A1] py-6 text-3xl font-extrabold text-slate-900 shadow-lg active:bg-[#7da790] transition-colors">
          {esUltimo ? <>Terminar <Check className="h-9 w-9" /></> : <>Siguiente <ArrowRight className="h-9 w-9" /></>}
        </button>
        <button onClick={alRepetir} aria-label="Repetir el paso" className="flex w-20 items-center justify-center rounded-2xl bg-slate-200 text-slate-900 active:bg-slate-300 transition-colors">
          <RotateCcw className="h-9 w-9" />
        </button>
      </div>
    </footer>
  );
}