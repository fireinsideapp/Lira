// Pantalla de cocina: intro -> pasos guiados con voz.
import { ArrowLeft, ChefHat, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBloqueoPantalla } from "../../compartido/hooks/useBloqueoPantalla";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener, hablar } from "../../voz";
import { useReceta } from "../recetas/api";
import type { Receta } from "../recetas/tipos";
import { InsigniaTemporizador } from "../temporizadores/InsigniaTemporizador";
import { AlertaEstufa } from "./componentes/AlertaEstufa";
import { ControlesPaso } from "./componentes/ControlesPaso";
import { useSesionCocina } from "./useSesionCocina";
import { VistaPaso } from "./VistaPaso";

let recetaPresentadaSlug = "";

export default function CocinaPagina() {
  const { slug = "" } = useParams();
  const { datos: receta, error, reintentar } = useReceta(slug);
  if (!receta) return <PantallaCarga error={error} alReintentar={reintentar} />;
  return <Cocina receta={receta} />;
}

function Cocina({ receta }: { receta: Receta }) {
  const navigate = useNavigate();
  const sesion = useSesionCocina(receta);
  const { paso, iniciada, terminada } = sesion;

  useBloqueoPantalla(iniciada && !terminada);
  const [audioDesbloqueado, setAudioDesbloqueado] = useState(false);

  const reproducirLecturaReceta = () => {
    detener();

    const ingredientesTexto = receta.ingredientes
      ?.map((i) => `${i.cantidad || ""} ${i.unidad || ""} ${i.nombre}`)
      .join(", ");

    const mensajeCompleto = ingredientesTexto
      ? `Receta de ${receta.titulo}. ${receta.descripcion}. Los ingredientes necesarios son: ${ingredientesTexto}. Presiona el botón verde para comenzar.`
      : `Receta de ${receta.titulo}. ${receta.descripcion}. Presiona el botón verde para comenzar.`;

    hablar(mensajeCompleto);
    setAudioDesbloqueado(true);
  };

  // Intentamos reproducir al cargar
  useEffect(() => {
    if (!iniciada && !terminada && receta && recetaPresentadaSlug !== receta.slug) {
      recetaPresentadaSlug = receta.slug;
      
      const timer = setTimeout(() => {
        reproducirLecturaReceta();
      }, 400);

      return () => {
        clearTimeout(timer);
        detener();
      };
    }
  }, [iniciada, terminada, receta]);

  const salir = () => {
    if (!iniciada || terminada || window.confirm("¿Quieres salir de la receta?")) {
      detener();
      recetaPresentadaSlug = "";
      navigate("/recetas");
    }
  };

  return (
    <div 
      onClick={() => {
        if (!audioDesbloqueado) {
          reproducirLecturaReceta();
        }
      }}
      className="flex flex-1 flex-col max-w-md mx-auto w-full bg-white min-h-screen relative pb-10"
    >
      <header className="flex items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              salir();
            }} 
            aria-label="Salir de la receta" 
            className="rounded-2xl bg-[#8FB9A1]/20 p-3 text-slate-900 active:bg-[#8FB9A1]/40 transition-colors"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 tracking-tight">{receta.titulo}</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 p-5">
        {!iniciada && (
          <>
            <div className="rounded-3xl border-4 border-[#8FB9A1]/30 bg-white p-6 text-center shadow-md flex flex-col gap-4">
              <ChefHat className="mx-auto h-16 w-16 text-[#8FB9A1]" aria-hidden />
              
              <p className="text-2xl font-bold leading-snug text-slate-900">
                {receta.descripcion}
              </p>

              {receta.ingredientes && receta.ingredientes.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left">
                  <p className="text-xl font-extrabold text-slate-900 mb-2 text-center">Ingredientes principales:</p>
                  <ul className="list-disc list-inside text-lg font-semibold text-slate-700 space-y-1">
                    {receta.ingredientes.map((ing, index) => (
                      <li key={index}>
                        {ing.cantidad} {ing.unidad} {ing.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón de aviso para liberar el audio del navegador al primer toque */}
              {!audioDesbloqueado && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reproducirLecturaReceta();
                  }}
                  className="mt-2 flex items-center justify-center gap-3 rounded-2xl bg-[#8FB9A1] p-4 text-xl font-bold text-slate-900 shadow-md active:scale-95 transition-transform"
                >
                  <Volume2 className="h-7 w-7 shrink-0" /> Toca aquí para que Lyra comience a hablar
                </button>
              )}

              {audioDesbloqueado && (
                <p className="mt-2 flex items-center justify-center gap-3 text-xl font-semibold text-slate-700">
                  <Volume2 className="h-7 w-7 shrink-0 text-[#8FB9A1]" aria-hidden /> Lyra te está leyendo la receta...
                </p>
              )}
            </div>

            <BotonGrande onClick={(e) => {
              e.stopPropagation();
              detener();
              recetaPresentadaSlug = "";
              sesion.iniciar();
            }}>
              Empezar a cocinar
            </BotonGrande>
          </>
        )}

        {paso && (
          <>
            <VistaPaso paso={paso} total={sesion.total} />
            {paso.estufa && <AlertaEstufa modo={paso.estufa} />}
          </>
        )}

        {terminada && (
          <div className="rounded-3xl border-4 border-green-200 bg-green-50 p-6 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-green-900">¡Terminamos!</p>
            <p className="mt-3 text-3xl font-bold text-green-900">Buen provecho 🍽️</p>
          </div>
        )}

        {sesion.temporizadores.map((t) => (
          <InsigniaTemporizador
            key={t.id}
            nombre={t.nombre}
            restante={t.restante}
            sonando={t.sonando}
            alQuitar={() => sesion.quitarTemporizador(t.id)}
          />
        ))}

        {terminada && <BotonGrande onClick={() => navigate("/recetas")}>Volver a las recetas</BotonGrande>}
      </main>

      {iniciada && !terminada && (
        <ControlesPaso
          esUltimo={sesion.esUltimo}
          alAnterior={sesion.anterior}
          alSiguiente={sesion.siguiente}
          alRepetir={sesion.repetir}
        />
      )}
    </div>
  );
}