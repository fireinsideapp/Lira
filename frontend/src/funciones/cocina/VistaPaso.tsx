// Tarjeta del paso actual: contador, texto grande, imagen opcional y nota de seguridad destacada.
import { TriangleAlert } from "lucide-react";
import type { Paso } from "../recetas/tipos";

// Si el JSON trae solo el nombre ("rojos-paso1.jpg"), se busca en /recetas/.
// Si ya trae una ruta ("/recetas/..." o "http..."), se usa tal cual.
function rutaImagen(imagen: string): string {
  if (imagen.startsWith("/") || imagen.startsWith("http")) return imagen;
  return `/recetas/${imagen}`;
}

export function VistaPaso({ paso, total }: { paso: Paso; total: number }) {
  return (
    <div className="rounded-3xl border-4 border-[#8FB9A1]/30 bg-white p-6 shadow-md">
      <span className="mb-4 inline-block rounded-full bg-[#8FB9A1] px-4 py-1 text-xl font-bold text-slate-900">
        Paso {paso.orden} de {total}
      </span>
      <p className="text-3xl font-bold leading-snug text-slate-900" aria-live="polite">
        {paso.texto}
      </p>

      {/* Imagen opcional del paso */}
      {paso.imagen && (
        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50">
          <img
            src={rutaImagen(paso.imagen)}
            alt={`Ilustración del paso ${paso.orden}: ${paso.texto}`}
            className="max-h-80 w-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      {paso.nota_seguridad && (
        <p className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-100 p-4 text-2xl font-bold text-amber-900">
          <TriangleAlert className="mt-1 h-8 w-8 shrink-0" aria-hidden />
          {paso.nota_seguridad}
        </p>
      )}
    </div>
  );
}