// Lista de recetas: tarjetas grandes con titulo y descripcion corta.
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener, hablar } from "../../voz";
import { useRecetas } from "./api";

export default function ListaRecetasPagina() {
  const { datos: recetas, error, reintentar } = useRecetas();

  // Guía de voz automática al entrar a la lista de recetas
  useEffect(() => {
    if (recetas) {
      hablar("¿Qué vamos a cocinar hoy? Elige una receta para comenzar.");
    }
    return () => {
      detener();
    };
  }, [recetas]);

  if (!recetas) return <PantallaCarga error={error} alReintentar={reintentar} />;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-md mx-auto min-h-screen bg-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-center mb-2">
        ¿Qué vamos a cocinar hoy?
      </h1>
      
      <div className="flex flex-col gap-4 w-full">
        {recetas.map((r) => (
          <Link
            key={r.slug}
            to={`/recetas/${r.slug}`}
            onClick={() => detener()} // Detiene la lectura al hacer clic en una receta
            className="flex items-center justify-between gap-4 rounded-2xl bg-[#8FB9A1] p-5 shadow-sm transition-transform active:scale-95 text-slate-900"
            style={{ backgroundColor: "#8FB9A1" }}
          >
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-wide">
                {r.titulo}
              </h2>
              <p className="mt-2 text-lg leading-snug text-slate-800 font-medium">
                {r.descripcion}
              </p>
            </div>
            
            {/* Círculo blanco con flecha idéntico a los mockups */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm shrink-0">
              <ChevronRight className="h-7 w-7 text-slate-900" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}