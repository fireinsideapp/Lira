// Lista de recetas: tarjetas grandes con titulo y descripcion corta.
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { useRecetas } from "./api";

export default function ListaRecetasPagina() {
  const { datos: recetas, error, reintentar } = useRecetas();

  if (!recetas) return <PantallaCarga error={error} alReintentar={reintentar} />;

  return (
    <div className="flex flex-1 flex-col gap-5 p-5">
      <h1 className="text-4xl font-extrabold text-slate-900">¿Qué vamos a cocinar hoy?</h1>
      {recetas.map((r) => (
        <Link
          key={r.slug}
          to={`/recetas/${r.slug}`}
          className="flex items-center gap-4 rounded-3xl border-4 border-blue-100 bg-white p-6 shadow-md active:bg-blue-50"
        >
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-blue-700">{r.titulo}</h2>
            <p className="mt-2 text-xl leading-snug text-slate-700">{r.descripcion}</p>
          </div>
          <ChevronRight className="h-10 w-10 shrink-0 text-blue-600" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
