// Pantalla de cocina: intro -> pasos guiados con voz -> cierre.
// El boton "Empezar a cocinar" es el toque que desbloquea el audio y activa el bloqueo de pantalla.
import { ArrowLeft, ChefHat, Volume2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useBloqueoPantalla } from "../../compartido/hooks/useBloqueoPantalla";
import { BotonGrande } from "../../compartido/ui/BotonGrande";
import { PantallaCarga } from "../../compartido/ui/PantallaCarga";
import { detener } from "../../voz";
import { useReceta } from "../recetas/api";
import type { Receta } from "../recetas/tipos";
import { InsigniaTemporizador } from "../temporizadores/InsigniaTemporizador";
import { AlertaEstufa } from "./componentes/AlertaEstufa";
import { ControlesPaso } from "./componentes/ControlesPaso";
import { useSesionCocina } from "./useSesionCocina";
import { VistaPaso } from "./VistaPaso";

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

  const salir = () => {
    if (!iniciada || terminada || window.confirm("¿Quieres salir de la receta?")) {
      detener();
      navigate("/recetas");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 p-5 pb-2">
        <button onClick={salir} aria-label="Salir de la receta" className="rounded-full bg-slate-200 p-3 text-slate-900">
          <ArrowLeft className="h-8 w-8" />
        </button>
        <h1 className="text-3xl font-extrabold leading-tight text-blue-700">{receta.titulo}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-5 p-5">
        {!iniciada && (
          <>
            <div className="rounded-3xl border-4 border-blue-100 bg-white p-6 text-center shadow-md">
              <ChefHat className="mx-auto mb-4 h-16 w-16 text-blue-600" aria-hidden />
              <p className="text-3xl font-bold leading-snug text-slate-900">
                ¿Listo? Te voy guiando paso a paso.
              </p>
              <p className="mt-4 flex items-center justify-center gap-3 text-2xl font-semibold text-slate-700">
                <Volume2 className="h-8 w-8 shrink-0 text-blue-600" aria-hidden /> Sube el volumen.
              </p>
            </div>
            <BotonGrande onClick={sesion.iniciar}>Empezar a cocinar</BotonGrande>
          </>
        )}

        {paso && (
          <>
            <VistaPaso paso={paso} total={sesion.total} />
            {paso.estufa && <AlertaEstufa modo={paso.estufa} />}
          </>
        )}

        {terminada && (
          <div className="rounded-3xl border-4 border-green-200 bg-green-50 p-6 text-center">
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
