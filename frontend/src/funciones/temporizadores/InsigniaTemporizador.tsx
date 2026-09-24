// Tarjeta del temporizador: verde con cuenta regresiva; roja y parpadeante cuando termina.
import { BellRing, Clock, X } from "lucide-react";

interface Props {
  nombre: string;
  restante: number; // segundos
  sonando: boolean;
  alQuitar: () => void;
}

const formato = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function InsigniaTemporizador({ nombre, restante, sonando, alQuitar }: Props) {
  if (sonando) {
    return (
      <div role="alert" className="flex animate-pulse items-center gap-4 rounded-3xl border-4 border-red-400 bg-red-50 p-5">
        <BellRing className="h-12 w-12 shrink-0 text-red-600" aria-hidden />
        <div className="flex-1">
          <p className="text-2xl font-extrabold text-red-900">¡Se acabó el tiempo!</p>
          <p className="text-xl font-semibold text-red-800">{nombre}</p>
        </div>
        <button onClick={alQuitar} className="rounded-2xl bg-red-600 px-5 py-4 text-xl font-extrabold text-white">
          Entendido
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 rounded-3xl border-4 border-green-200 bg-green-50 p-5">
      <Clock className="h-12 w-12 shrink-0 text-green-700" aria-hidden />
      <div className="flex-1">
        <p className="text-xl font-bold text-green-900">{nombre}</p>
        <p className="text-4xl font-extrabold text-green-900" aria-live="off">{formato(restante)}</p>
      </div>
      <button onClick={alQuitar} aria-label={`Cancelar temporizador de ${nombre}`} className="rounded-full bg-green-100 p-3 text-green-900">
        <X className="h-8 w-8" />
      </button>
    </div>
  );
}
