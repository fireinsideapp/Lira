// Tarjeta del paso actual: contador, texto grande y nota de seguridad destacada.
import { TriangleAlert } from "lucide-react";
import type { Paso } from "../recetas/tipos";

export function VistaPaso({ paso, total }: { paso: Paso; total: number }) {
  return (
    <div className="rounded-3xl border-4 border-[#8FB9A1]/30 bg-white p-6 shadow-md">
      <span className="mb-4 inline-block rounded-full bg-[#8FB9A1] px-4 py-1 text-xl font-bold text-slate-900">
        Paso {paso.orden} de {total}
      </span>
      <p className="text-3xl font-bold leading-snug text-slate-900" aria-live="polite">
        {paso.texto}
      </p>
      {paso.nota_seguridad && (
        <p className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-100 p-4 text-2xl font-bold text-amber-900">
          <TriangleAlert className="mt-1 h-8 w-8 shrink-0" aria-hidden />
          {paso.nota_seguridad}
        </p>
      )}
    </div>
  );
}