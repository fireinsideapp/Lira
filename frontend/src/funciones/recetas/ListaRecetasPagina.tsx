// frontend/src/funciones/recetas/ListaRecetasPagina.tsx
// Ya no lee automaticamente todas las recetas. En vez de eso, pregunta que quiere cocinar
// y busca por voz; si no la tenemos, lo dice con honestidad. Las tarjetas siguen como respaldo tactil.
import { ChevronRight, Mic } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener, hablar, useVoz } from "../../voz";
import { escucharNavegador, hayReconocimientoNavegador } from "../../voz/transcripcion/reconocimientoNavegador";
import { useRecetas } from "./api";
import { buscarRecetas, elegirEntre } from "./buscarReceta";

export default function ListaRecetasPagina() {
  const { datos: recetas, error, reintentar } = useRecetas();
  const navigate = useNavigate();
  const { estado, setEstado } = useVoz();

  // yaNavegoRef evita que un segundo toque (o un resultado de voz tardio) navegue dos veces.
  // activoRef se apaga al desmontar, para ignorar resultados de voz que lleguen despues de cambiar de pantalla.
  const yaNavegoRef = useRef(false);
  const activoRef = useRef(true);

  useEffect(() => {
    activoRef.current = true;
    yaNavegoRef.current = false;
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

  const buscarPorVoz = async () => {
  if (!recetas || !hayReconocimientoNavegador()) {
    hablar("Por ahora, toca una receta de la lista.");
    return;
  }
  detener();
  setEstado("escuchando");
  try {
    const texto = await escucharNavegador();
    if (!activoRef.current) return;

    const encontradas = buscarRecetas(texto, recetas);

    if (encontradas.length === 0) {
      await hablar("Por el momento no contamos con esa receta. Puedes elegir una de la lista.");
      return;
    }

    if (encontradas.length === 1) {
      const receta = encontradas[0];
      await hablar(`Tenemos ${receta.titulo}. Vamos a prepararla.`);
      if (!activoRef.current) return;
      irA(receta.slug);
      return;
    }

    // Varias coincidencias: las lee y pregunta cual quiere.
    const nombres = encontradas.map((r) => r.titulo).join(", ");
    await hablar(`Tenemos estas opciones: ${nombres}. ¿Cuál te gustaría?`);
    if (!activoRef.current) return;

    setEstado("escuchando");
    const segundaRespuesta = await escucharNavegador();
    if (!activoRef.current) return;

    const elegida = elegirEntre(segundaRespuesta, encontradas);
    if (elegida) {
      await hablar(`Vamos a preparar ${elegida.titulo}.`);
      if (!activoRef.current) return;
      irA(elegida.slug);
    } else {
      await hablar("No logré identificar cuál quieres. Puedes tocar una de la lista.");
    }
  } catch {
    if (activoRef.current) hablar("No te escuché bien, intenta de nuevo.");
  } finally {
    if (activoRef.current) setEstado("espera");
  }
};

  if (!recetas) return <PantallaCarga error={error} alReintentar={reintentar} />;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-md mx-auto min-h-screen bg-white">
      <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        ¿Qué vamos a cocinar hoy?
      </h1>

      <button
        onClick={buscarPorVoz}
        className={`flex items-center justify-center gap-3 rounded-2xl py-5 text-2xl font-extrabold text-white shadow-md active:scale-95 ${
          estado === "escuchando" ? "animate-pulse bg-red-600" : "bg-blue-600"
        }`}
      >
        <Mic className="h-8 w-8" aria-hidden />
        {estado === "escuchando" ? "Te escucho…" : "Decir qué quiero cocinar"}
      </button>

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