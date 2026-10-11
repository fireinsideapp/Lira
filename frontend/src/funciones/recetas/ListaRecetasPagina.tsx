// frontend/src/funciones/recetas/ListaRecetasPagina.tsx
// Lyra pregunta qué quiere cocinar y escucha sola (sin tocar nada). Las tarjetas siguen como respaldo táctil.
import { ChevronRight, Ear, EarOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener, hablar } from "../../voz";
import { hayReconocimientoNavegador } from "../../voz/transcripcion/reconocimientoNavegador";
import { useEscuchaAutomatica } from "../cocina/useEscuchaAutomatica";
import { useRecetas } from "./api";
import { buscarRecetas, elegirEntre } from "./buscarReceta";
import type { RecetaResumen } from "./tipos";

export default function ListaRecetasPagina() {
  const { datos: recetas, error, reintentar } = useRecetas();
  const navigate = useNavigate();
  const [escuchaAuto, setEscuchaAuto] = useState(true); // el usuario puede pausarla con el botón

  // yaNavegoRef evita que un segundo toque (o un resultado de voz tardío) navegue dos veces.
  // activoRef se apaga al desmontar, para ignorar resultados de voz que lleguen después de cambiar de pantalla.
  // opcionesRef guarda las recetas entre las que Lyra pidió elegir ("¿Cuál te gustaría?").
  const yaNavegoRef = useRef(false);
  const activoRef = useRef(true);
  const opcionesRef = useRef<RecetaResumen[] | null>(null);

  useEffect(() => {
    activoRef.current = true;
    yaNavegoRef.current = false;
    opcionesRef.current = null;
    if (recetas && recetas.length > 0) {
      hablar("¿Qué te gustaría cocinar hoy?");
    }
    return () => {
      activoRef.current = false;
      detener();
    };
  }, [recetas]);

  const irA = (slug: string) => {
    if (yaNavegoRef.current) return;
    yaNavegoRef.current = true;
    detener();
    navigate(`/recetas/${slug}`);
  };

  // Lo que el usuario dice se procesa aquí; después Lyra vuelve a escuchar sola.
  const procesarVoz = async (texto: string) => {
    if (!recetas || !activoRef.current) return;

    // Si Lyra acaba de preguntar "¿Cuál te gustaría?", esta respuesta elige entre las opciones.
    if (opcionesRef.current) {
      const opciones = opcionesRef.current;
      opcionesRef.current = null;
      const elegida = elegirEntre(texto, opciones);
      if (elegida) {
        await hablar(`Vamos a preparar ${elegida.titulo}.`);
        if (activoRef.current) irA(elegida.slug);
      } else {
        await hablar("No logré identificar cuál quieres. Dime el nombre de la receta, o toca una de la lista.");
      }
      return;
    }

    const encontradas = buscarRecetas(texto, recetas);

    if (encontradas.length === 0) {
      await hablar("Por el momento no contamos con esa receta. Puedes decir otra, o elegir una de la lista.");
      return;
    }

    if (encontradas.length === 1) {
      const receta = encontradas[0];
      await hablar(`Tenemos ${receta.titulo}. Vamos a prepararla.`);
      if (activoRef.current) irA(receta.slug);
      return;
    }

    // Varias coincidencias: las lee y pregunta cuál quiere. La escucha automática recoge la respuesta.
    opcionesRef.current = encontradas;
    const nombres = encontradas.map((r) => r.titulo).join(", ");
    await hablar(`Tenemos estas opciones: ${nombres}. ¿Cuál te gustaría?`);
  };

  const hayMicrofono = hayReconocimientoNavegador();

  useEscuchaAutomatica({
    activa: escuchaAuto && !!recetas && hayMicrofono,
    procesarTexto: procesarVoz,
    alTranscribir: () => {},
    alDetenerse: () => setEscuchaAuto(false),
  });

  const alternarEscucha = () => {
    if (escuchaAuto) {
      setEscuchaAuto(false);
      hablar("Listo, ya no te escucho solo. Puedes tocar una receta de la lista.");
    } else {
      setEscuchaAuto(true);
      hablar("Listo, vuelvo a escucharte.");
    }
  };

  if (!recetas) return <PantallaCarga error={error} alReintentar={reintentar} />;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-md mx-auto min-h-screen bg-white">
      <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        ¿Qué vamos a cocinar hoy?
      </h1>

      {hayMicrofono && (
        <button
          onClick={alternarEscucha}
          className={`flex items-center justify-center gap-3 rounded-2xl border-4 p-4 text-xl font-extrabold active:scale-95 ${
            escuchaAuto
              ? "border-[#8FB9A1] bg-[#8FB9A1]/20 text-slate-900"
              : "border-slate-300 bg-slate-100 text-slate-700"
          }`}
        >
          {escuchaAuto ? (
            <>
              <Ear className="h-7 w-7" aria-hidden /> Te escucho solo · Toca para pausar
            </>
          ) : (
            <>
              <EarOff className="h-7 w-7" aria-hidden /> Escucha pausada · Toca para activar
            </>
          )}
        </button>
      )}

      <div className="flex w-full flex-col gap-4">
        {recetas.map((r) => (
          <button
            key={r.slug}
            onClick={() => irA(r.slug)}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 text-left text-slate-900 shadow-sm transition-transform active:scale-95"
            style={{ borderColor: "#8FB9A1", borderWidth: "5px", borderStyle: "solid" }}
          >
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold tracking-wide text-slate-900">{r.titulo}</h2>
              <p className="mt-2 text-lg font-medium leading-snug text-slate-800">{r.descripcion}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <ChevronRight className="h-7 w-7 text-slate-900" aria-hidden />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}