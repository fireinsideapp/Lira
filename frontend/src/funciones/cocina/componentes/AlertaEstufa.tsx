// Alerta de estufa: fija mientras esta encendida, grande y parpadeante cuando hay que apagarla.
import { Flame } from "lucide-react";

export function AlertaEstufa({ modo }: { modo: "encendida" | "apagar" }) {
  const apagar = modo === "apagar";
  return (
    <div
      role="alert"
      className={`flex items-center gap-4 rounded-3xl border-4 border-red-300 bg-red-50 p-5 ${apagar ? "animate-pulse" : ""}`}
    >
      <Flame className="h-12 w-12 shrink-0 text-red-600" aria-hidden />
      <h3 className={`font-extrabold text-red-800 ${apagar ? "text-3xl" : "text-2xl"}`}>
        {apagar ? "¡APAGA LA ESTUFA AHORA!" : "Estufa encendida"}
      </h3>
    </div>
  );
}
