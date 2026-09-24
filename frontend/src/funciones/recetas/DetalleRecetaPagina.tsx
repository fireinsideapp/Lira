// Detalle de una receta: descripcion, ingredientes agrupados y boton grande "Cocinar juntos".
import { ArrowLeft, ChefHat } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { useReceta } from "./api";
import type { Ingrediente } from "./tipos";

function agrupar(ingredientes: Ingrediente[]) {
  const grupos = new Map<string, Ingrediente[]>();
  for (const i of ingredientes) grupos.set(i.grupo, [...(grupos.get(i.grupo) ?? []), i]);
  return [...grupos.entries()];
}

export default function DetalleRecetaPagina() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { datos: receta, error, reintentar } = useReceta(slug);

  if (!receta) return <PantallaCarga error={error} alReintentar={reintentar} />;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 p-5">
        <button
          onClick={() => navigate("/recetas")}
          className="flex w-fit items-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 text-xl font-bold text-slate-900"
        >
          <ArrowLeft className="h-7 w-7" aria-hidden /> Recetas
        </button>
        <h1 className="text-4xl font-extrabold text-blue-700">{receta.titulo}</h1>
        <p className="text-2xl leading-snug text-slate-800">{receta.descripcion}</p>

        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Ingredientes</h2>
        {agrupar(receta.ingredientes).map(([grupo, lista]) => (
          <section key={grupo} className="rounded-3xl bg-slate-50 p-5">
            {grupo && <h3 className="mb-2 text-2xl font-bold text-blue-700">{grupo}</h3>}
            <ul className="flex flex-col gap-2">
              {lista.map((i) => (
                <li key={i.nombre} className="text-xl text-slate-800">
                  • {i.nombre}
                  {i.cantidad && <span className="font-bold"> — {i.cantidad}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 border-t-2 border-slate-100 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <BotonGrande onClick={() => navigate(`/cocina/${receta.slug}`)}>
          <ChefHat className="h-9 w-9" aria-hidden /> Cocinar juntos
        </BotonGrande>
      </div>
    </div>
  );
}
